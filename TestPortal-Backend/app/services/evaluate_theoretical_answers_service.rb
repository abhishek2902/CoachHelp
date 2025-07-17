class EvaluateTheoreticalAnswersService
  API_ENDPOINT = "https://api.aimlapi.com/v1/chat/completions".freeze
  DEFAULT_MODEL = "gpt-4o".freeze  # Correct model name
  MAX_TOKENS = 5
  TEMPERATURE = 0.1
  TIMEOUT = 30 # seconds

  def initialize(theoretical_inputs)
    @inputs = Array(theoretical_inputs)
  end

  def call
    return error_response('Invalid input format') unless valid_input_format?
    return error_response('No questions provided') if @inputs.empty?

    Rails.logger.debug "Starting theoretical answers evaluation for #{@inputs.count} questions"

    results = @inputs.map do |input|
      begin
        Rails.logger.debug "Evaluating question #{input[:question_id]}"
        result = evaluate_single_question(input)
        Rails.logger.debug "Question #{input[:question_id]} evaluated successfully"
        result
      rescue StandardError => e
        Rails.logger.error "Error evaluating question #{input[:question_id]}: #{e.message}"
        handle_evaluation_error(input, e)
      end
    end

    Rails.logger.debug "Theoretical answers evaluation completed"
    { success: true, results: results }
  rescue StandardError => e
    Rails.logger.error("Service Error: #{e.message}\n#{e.backtrace.join("\n")}")
    error_response("Evaluation service failed: #{e.message}")
  end

  private

  def valid_input_format?
    @inputs.all? { |i| i.is_a?(Hash) && i.key?(:question_id) && i.key?(:given) && (i.key?(:marks) || i.key?(:max_marks)) }
  end

  def strip_html(text)
    return "" if text.blank?
    text.gsub(/<[^>]*>/, '').gsub(/&nbsp;/, ' ').squish
  end

  def evaluate_single_question(input)
    return empty_answer_result(input) if input[:given].blank?

    normalized_input = {
      question_id: input[:question_id],
      question: strip_html(input[:question]),
      expected: strip_html(input[:expected]),
      given: input[:given].to_s.strip,
      marks: input[:marks] || input[:max_marks]
    }

    response = call_aiml_api(normalized_input)
    process_api_response(normalized_input, response)
  end

  def call_aiml_api(input)
    Rails.logger.debug "Making API call for question #{input[:question_id]}"
    
    uri = URI.parse(API_ENDPOINT)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_PEER
    http.open_timeout = TIMEOUT
    http.read_timeout = TIMEOUT

    request = Net::HTTP::Post.new(uri.path)
    request['Authorization'] = "Bearer #{ENV.fetch('AIMLAPI_KEY', '')}"
    request['Content-Type'] = 'application/json'
    request.body = build_request_body(input).to_json

    Rails.logger.debug "Sending API request..."
    response = http.request(request)
    Rails.logger.debug "API response received: #{response.code}"
    
    if response.code.to_i.between?(200, 299)
      JSON.parse(response.body)
    else
      raise "API Error #{response.code}: #{response.body}"
    end
  rescue OpenSSL::SSL::SSLError => e
    Rails.logger.debug "SSL Error: #{e.message}"
    # Fallback to SSL verification disabled in development
    if Rails.env.development?
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      retry
    else
      raise "SSL Verification Failed: #{e.message}"
    end
  rescue Net::ReadTimeout, Net::OpenTimeout => e
    Rails.logger.error "API Timeout: #{e.message}"
    raise "API Timeout: #{e.message}"
  rescue JSON::ParserError => e
    Rails.logger.error "Invalid API Response: #{e.message}"
    raise "Invalid API Response: #{e.message}"
  rescue => e
    Rails.logger.error "API Request Failed: #{e.message}"
    raise "API Request Failed: #{e.message}"
  end

  def build_request_body(input)
    {
      model: DEFAULT_MODEL,  # Use the constant here
      messages: [
        { 
          role: "system",
          content: system_prompt(input)
        },
        { 
          role: "user",
          content: user_prompt(input)
        }
      ],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE
    }
  end

  def system_prompt(input)
    max_marks = input[:marks]
    <<~PROMPT
      You are an exam evaluator. Follow these rules exactly:
      1. Ignore ALL formatting differences (case, whitespace, punctuation)
      2. Compare the semantic meaning
      3. Scoring:
         - Full meaning match: #{max_marks} marks
         - Contains key term(s): #{max_marks.to_f / 2} marks
         - Wrong answer: 0 marks
      4. Return ONLY the score as a number between 0-#{max_marks}
      
      Examples:
      - Expected "Paris", Answer "paris" → #{max_marks}
      - Expected "Jupiter Planet", Answer "Jupiter" → #{max_marks / 2}
      - Expected "299,792,458 m/s", Answer "speed of light" → #{max_marks / 2}
    PROMPT
  end

  def user_prompt(input)
    max_marks = input[:marks]
    <<~PROMPT
      [Question]
      #{input[:question]}

      [Expected Answer]
      #{input[:expected]}

      [Student's Answer]
      #{input[:given]}

      [Scoring]
      Maximum Marks: #{max_marks}
      Score (0-#{max_marks}):
    PROMPT
  end

  def process_api_response(input, response)
    raw_score = extract_score_from_response(response)
    numeric_score = clamp_score(raw_score, input[:marks])

    {
      question_id: input[:question_id],
      marks_awarded: numeric_score,
      max_marks: input[:marks],
      given: input[:given],
      debug: { 
        raw_score: raw_score,
        normalized_question: input[:question],
        normalized_expected: input[:expected]
      }
    }
  end

  def extract_score_from_response(response)
    response.dig('choices', 0, 'message', 'content').to_s.strip
  rescue
    '0' # Default to 0 if extraction fails
  end

  def clamp_score(score, max_marks)
    [[score.to_f, 0].max, max_marks].min.round
  rescue
    0 # Return 0 if score conversion fails
  end

  def empty_answer_result(input)
    {
      question_id: input[:question_id],
      marks_awarded: 0,
      max_marks: input[:marks] || input[:max_marks],
      given: input[:given],
      debug: { message: "Empty answer" }
    }
  end

  def handle_evaluation_error(input, error)
    {
      question_id: input[:question_id],
      marks_awarded: 0,
      max_marks: input[:marks] || input[:max_marks],
      given: input[:given],
      error: "Evaluation failed",
      details: error.message,
      debug: { error: error.class.name }
    }
  end

  def error_response(message)
    { success: false, error: message, status: :unprocessable_entity }
  end
end
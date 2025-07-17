class CodeCompilerService
  require 'net/http'
  require 'json'
  require 'uri'

  def initialize(compiler_url = nil)
    @compiler_url = @compiler_url || ENV['COMPILER_SERVICE_URL']
  end

  def compile_and_test(coding_test, solution_code, language = 'javascript')
    begin
      # Prepare test cases for the compiler service
      test_cases = coding_test.test_cases.map do |test_case|
        # Parse input if it's a string representation of a hash
        parsed_input = parse_test_case_input(test_case.input)
        
        {
          input: parsed_input,
          expected_output: test_case.expected_output
        }
      end

      # Format the code based on language to ensure it produces output
      formatted_code = format_code_for_language(solution_code, language, coding_test)

      # Prepare request payload
      payload = {
        language: language,
        code: formatted_code,
        test_cases: test_cases
      }

      # Make request to compiler service
      response = make_request(payload)

      if response[:success]
        process_results(response[:data], coding_test)
      else
        {
          success: false,
          error: response[:error] || 'Compilation failed',
          test_results: []
        }
      end

    rescue => e
      Rails.logger.error "Code compilation error: #{e.message}"
      {
        success: false,
        error: "Service temporarily unavailable: #{e.message}",
        test_results: []
      }
    end
  end

  private

  def make_request(payload)
    uri = URI.parse("#{@compiler_url}/compile")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 30
    http.open_timeout = 10

    request = Net::HTTP::Post.new(uri.path, {
      'Content-Type' => 'application/json',
      'Accept' => 'application/json'
    })
    request.body = payload.to_json

    response = http.request(request)

    case response
    when Net::HTTPSuccess
      {
        success: true,
        data: JSON.parse(response.body)
      }
    else
      {
        success: false,
        error: "HTTP #{response.code}: #{response.body}"
      }
    end

  rescue JSON::ParserError => e
    {
      success: false,
      error: "Invalid JSON response from compiler service"
    }
  rescue Net::TimeoutError => e
    {
      success: false,
      error: "Request timeout: #{e.message}"
    }
  rescue => e
    {
      success: false,
      error: "Network error: #{e.message}"
    }
  end

  def process_results(compiler_response, coding_test)
    results = compiler_response['results'] || []
    
    test_results = results.map.with_index do |result, index|
      test_case = coding_test.test_cases[index]
      
      {
        test_case_id: test_case&.id,
        input: result['input'],
        expected_output: result['expected_output'],
        actual_output: result['actual_output'],
        passed: result['passed'],
        errors: result['errors'],
        exit_code: result['exit_code'],
        execution_time: result['execution_time'] || 0
      }
    end

    total_tests = test_results.count
    passed_tests = test_results.count { |result| result[:passed] }
    score = calculate_score(passed_tests, total_tests, coding_test.marks)

    {
      success: true,
      test_results: test_results,
      total_tests: total_tests,
      passed_tests: passed_tests,
      failed_tests: total_tests - passed_tests,
      score: score,
      success_rate: total_tests > 0 ? (passed_tests.to_f / total_tests * 100).round(2) : 0
    }
  end

  def calculate_score(passed_tests, total_tests, max_marks)
    return 0 if total_tests == 0
    
    (passed_tests.to_f / total_tests * max_marks).round(2)
  end

  def format_code_for_language(code, language, coding_test)
    case language.downcase
    when 'ruby'
      # For Ruby, we need to ensure the code can handle the test case inputs
      # The compiler service will handle the variable injection
      code
    when 'python'
      # For Python, ensure proper formatting
      code
    when 'javascript'
      # For JavaScript, ensure proper formatting
      code
    else
      code
    end
  end

  def extract_function_name(code)
    # Extract function name from JavaScript code
    match = code.match(/function\s+(\w+)\s*\(/)
    match ? match[1] : nil
  end

  def extract_python_function_name(code)
    # Extract function name from Python code
    match = code.match(/def\s+(\w+)\s*\(/)
    match ? match[1] : nil
  end

  def extract_ruby_function_name(code)
    # Extract function name from Ruby code
    match = code.match(/def\s+(\w+)/)
    match ? match[1] : nil
  end

  def parse_test_case_input(input)
    return input if input.blank?
    
    # If input is already a hash, return it
    return input if input.is_a?(Hash)
    
    # Try to parse as JSON first
    begin
      return JSON.parse(input)
    rescue JSON::ParserError
      # If JSON parsing fails, try to parse as Ruby hash string
      begin
        # Handle Ruby hash format like {a: 2, b: 2}
        ruby_hash_string = input.strip
        if ruby_hash_string.start_with?('{') && ruby_hash_string.end_with?('}')
          # Convert Ruby hash syntax to JSON-like syntax
          json_like = ruby_hash_string.gsub(/(\w+):/, '"\1":')
          return JSON.parse(json_like)
        end
      rescue JSON::ParserError
        # If all parsing fails, return as string
        return input
      end
    end
    
    # Fallback to original input
    input
  end
end 
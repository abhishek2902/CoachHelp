# app/services/ai_parser_service.rb
require 'net/http'
require 'uri'
require 'json'
require 'tempfile'
require 'open-uri'
require 'pdf-reader'
require 'mini_magick'
require 'base64'
require 'docx'
require 'digest'

class AiParserService
  MAX_CHARS = 300  # Smaller chunk size for each AI call
  OVERLAP = 20     # Smaller overlap between chunks
  MAX_PAGES = 2
  BATCH_SIZE = 10
  
  # New constants for large data handling
  MAX_CONTEXT_TOKENS = 3000  # Maximum tokens to use for context
  MAX_SECTIONS_IN_CONTEXT = 3  # Maximum sections to include in context
  MAX_QUESTIONS_PER_SECTION = 5  # Maximum questions per section in context
  MAX_CONVERSATION_HISTORY = 5  # Maximum conversation history messages

  def self.cache_dir
    @cache_dir ||= begin
      cache_dir = Rails.root.join('tmp', 'ai_cache')
      Dir.mkdir(cache_dir) unless Dir.exist?(cache_dir)
      cache_dir
    end
  end

  # New method to intelligently manage context for large datasets
  def self.optimize_context_for_large_data(latest_test_update, user_message, conversation)
    # Check if we're dealing with a large dataset
    total_questions = latest_test_update&.dig('sections')&.sum { |s| s['questions']&.length || 0 } || 0
    total_sections = latest_test_update&.dig('sections')&.length || 0
    
    if total_questions > 30 || total_sections > 5
      Rails.logger.info("Large dataset detected: #{total_sections} sections, #{total_questions} questions")
      return create_optimized_context(latest_test_update, user_message, conversation)
    else
      # For smaller datasets, use the original approach
      return create_full_context(latest_test_update, user_message, conversation)
    end
  end

  # Create optimized context for large datasets
  def self.create_optimized_context(latest_test_update, user_message, conversation)
    # 1. Analyze user intent to determine which sections are relevant
    relevant_sections = identify_relevant_sections(latest_test_update, user_message)
    
    # 2. Create a summary of the full test structure
    test_summary = create_test_summary(latest_test_update)
    
    # 3. Include only relevant sections in detail
    detailed_sections = include_relevant_sections(latest_test_update, relevant_sections)
    
    # 4. Truncate conversation history
    truncated_conversation = truncate_conversation_history(conversation)
    
    # 5. Create optimized test structure
    optimized_test_update = {
      'title' => latest_test_update['title'],
      'description' => latest_test_update['description'],
      'test_type' => latest_test_update['test_type'],
      'duration' => latest_test_update['duration'],
      'sections' => detailed_sections,
      '_summary' => test_summary,
      '_relevant_sections' => relevant_sections,
      '_total_sections' => latest_test_update['sections']&.length || 0,
      '_total_questions' => latest_test_update['sections']&.sum { |s| s['questions']&.length || 0 } || 0
    }
    
    return {
      messages: build_optimized_messages(truncated_conversation, optimized_test_update, user_message),
      context_type: 'optimized',
      relevant_sections: relevant_sections
    }
  end

  # Create full context for smaller datasets
  def self.create_full_context(latest_test_update, user_message, conversation)
    messages = conversation.flat_map do |msg|
      arr = []
      arr << { role: "user", content: msg[:user] } if msg[:user]
      arr << { role: "assistant", content: msg[:bot] } if msg[:bot]
      arr
    end

    if latest_test_update
      messages << {
        role: "user",
        content: "Current test structure: #{latest_test_update.to_json}"
      }
      messages << {
        role: "assistant", 
        content: "I can see the current test structure. What would you like me to do with it?"
      }
    end

    messages << { role: "user", content: user_message }
    
    return {
      messages: [create_system_prompt] + messages,
      context_type: 'full'
    }
  end

  # Identify which sections are relevant to the user's request
  def self.identify_relevant_sections(latest_test_update, user_message)
    return [] unless latest_test_update&.dig('sections')
    
    user_message_lower = user_message.downcase
    relevant_sections = []
    
    latest_test_update['sections'].each_with_index do |section, index|
      section_name_lower = section['name'].downcase
      
      # Check if user mentioned this section specifically
      if user_message_lower.include?(section_name_lower) ||
         user_message_lower.include?("section #{index + 1}") ||
         user_message_lower.include?("section #{section['name']}")
        relevant_sections << index
      end
      
      # Check for common patterns
      if user_message_lower.match?(/add.*question.*#{section_name_lower}/i) ||
         user_message_lower.match?(/modify.*#{section_name_lower}/i) ||
         user_message_lower.match?(/change.*#{section_name_lower}/i)
        relevant_sections << index
      end
    end
    
    # If no specific sections mentioned, include first few sections
    if relevant_sections.empty?
      relevant_sections = [0, 1, 2].select { |i| i < latest_test_update['sections'].length }
    end
    
    relevant_sections.uniq
  end

  # Create a summary of the test structure
  def self.create_test_summary(latest_test_update)
    return {} unless latest_test_update
    
    {
      'total_sections' => latest_test_update['sections']&.length || 0,
      'total_questions' => latest_test_update['sections']&.sum { |s| s['questions']&.length || 0 } || 0,
      'section_summaries' => latest_test_update['sections']&.map do |section|
        {
          'name' => section['name'],
          'question_count' => section['questions']&.length || 0,
          'duration' => section['duration']
        }
      end || []
    }
  end

  # Include only relevant sections in detail
  def self.include_relevant_sections(latest_test_update, relevant_sections)
    return [] unless latest_test_update&.dig('sections')
    
    relevant_sections.map do |section_index|
      section = latest_test_update['sections'][section_index]
      next unless section
      
      # Limit questions per section to prevent context overflow
      questions = section['questions']&.first(MAX_QUESTIONS_PER_SECTION) || []
      
      {
        'name' => section['name'],
        'duration' => section['duration'],
        'questions' => questions,
        '_original_index' => section_index,
        '_total_questions' => section['questions']&.length || 0
      }
    end.compact
  end

  # Truncate conversation history to prevent context overflow
  def self.truncate_conversation_history(conversation)
    return [] if conversation.empty?
    
    # Keep only the most recent messages
    conversation.last(MAX_CONVERSATION_HISTORY)
  end

  # Build optimized messages for large datasets
  def self.build_optimized_messages(conversation, optimized_test_update, user_message)
    messages = conversation.flat_map do |msg|
      arr = []
      arr << { role: "user", content: msg[:user] } if msg[:user]
      arr << { role: "assistant", content: msg[:bot] } if msg[:bot]
      arr
    end

    if optimized_test_update
      messages << {
        role: "user",
        content: "Current test structure (optimized view): #{optimized_test_update.to_json}"
      }
      messages << {
        role: "assistant", 
        content: "I can see the current test structure. Note: This is an optimized view showing relevant sections. The full test has #{optimized_test_update['_total_sections']} sections with #{optimized_test_update['_total_questions']} total questions. What would you like me to do?"
      }
    end

    messages << { role: "user", content: user_message }
    
    [create_optimized_system_prompt] + messages
  end

  # Create optimized system prompt for large datasets
  def self.create_optimized_system_prompt
    {
      role: "system",
      content: <<~PROMPT
        You are a step-by-step, conversational test creation assistant for building structured tests.

        CRITICAL INSTRUCTIONS FOR LARGE DATASETS:
        - You are working with an optimized view of a large test structure
        - The context shows only relevant sections, but you must maintain the FULL test structure
        - When updating, you MUST return the COMPLETE test structure, not just the visible sections
        - Use the _summary information to understand the full scope of the test
        - If you need to modify sections not shown in context, use the section names from _summary
        - NEVER lose data from sections not shown in the current context
        - If the user asks about sections not visible, refer to the _summary and ask for clarification

        JSON FORMAT (MANDATORY):
        {
          "message": "A short summary of what changed, or a confirmation.",
          "test_update": {
            "title": "string",
            "description": "string", 
            "test_type": "string",
            "duration": "string",
            "sections": [
              {
                "name": "string",
                "duration": "number",
                "questions": [
                  {
                    "question_type": "MCQ|MSQ|theoretical",
                    "content": "string",
                    "options": ["string"],
                    "correct_answer": "string",
                    "correct_answers": ["string"],
                    "marks": number,
                    "duration": "number"
                  }
                ]
              }
            ]
          }
        }

        IMPORTANT RULES:
        1. ALWAYS return the COMPLETE test structure, not just visible sections
        2. If modifying a section not in context, preserve all other sections exactly as they were
        3. Use section names from _summary to identify sections not in current context
        4. If unsure about a section not in context, ask the user to specify the section name
        5. NEVER return incomplete or malformed JSON
        6. Return ONLY the JSON object, nothing else

        If you do not follow this format, the user will lose data.
      PROMPT
    }
  end

  # Create standard system prompt
  def self.create_system_prompt
    {
      role: "system",
      content: <<~PROMPT
        You are a step-by-step, conversational test creation assistant for building structured tests.

        CRITICAL INSTRUCTIONS:
        - You MUST check the current test state (provided in the conversation) before making any changes
        - If the user asks to add NEW sections, create them with appropriate names and content
        - If the user asks to add questions to a section that doesn't exist, create the section first, then add the questions
        - If the user asks to add questions to a section that exists, actually add the questions and return the updated structure
        - After every user message, you MUST return the *entire, up-to-date* test structure as a valid JSON object in the 'test_update' field
        - The JSON must include ALL sections and ALL questions, both old and new. Do NOT return only the new or changed sections
        - If the user says "correct", "looks good", or similar, return the current full structure
        - If the user says "reset", return an empty test structure
        - If you do not follow this, the user will lose data
        - NEVER use code block markers (no ```json ... ```). Return ONLY the JSON object.
        - NEVER use markdown formatting. Return ONLY the JSON object.
        - NEVER add any text before or after the JSON object.

        JSON FORMAT (MANDATORY):
        {
          "message": "A short summary of what changed, or a confirmation.",
          "test_update": {
            "title": "string",
            "description": "string", 
            "test_type": "string",
            "duration": "string",
            "sections": [
              {
                "name": "string",
                "duration": "number", // MUST be included for each section as integer minutes
                "questions": [
                  {
                    "question_type": "MCQ|MSQ|theoretical",
                    "content": "string",
                    "options": ["string"], // for MCQ/MSQ
                    "correct_answer": "string", // for MCQ
                    "correct_answers": ["string"], // for MSQ
                    "marks": number,
                    "duration": "number" // time in minutes as integer for this question
                  }
                ]
              }
            ]
          }
        }

        IMPORTANT RULES:
        1. EVERY section MUST have a "duration" field specified as an integer (minutes)
        2. The sum of all section durations should equal the total test duration
        3. Each question MUST have a "duration" field specified as an integer (minutes)
        4. The sum of all question durations in a section should equal the section duration
        5. If the user asks to add NEW sections, create them with meaningful names and appropriate content
        6. If the user asks to add questions to a section that doesn't exist, create the section first
        7. NEVER return incomplete or malformed JSON
        8. NEVER claim to have done something you haven't actually done
        9. If you cannot complete the request, say so clearly and return the current structure unchanged
        10. NEVER use code block markers (```json ... ```) - return only the JSON object
        11. Keep the JSON response concise but complete - avoid unnecessary verbosity
        12. NEVER add explanatory text before or after the JSON
        13. NEVER use markdown formatting
        14. Return ONLY the JSON object, nothing else

        For each question type:
        - MCQ: Must have exactly 4 options and one correct answer (A, B, C, or D)
        - MSQ: Must have 4-6 options and multiple correct answers
        - Theoretical: No options needed, just content and marks

        SPECIAL HANDLING:
        - When user asks to "add X sections", create X new sections with meaningful names related to the test topic
        - When user asks to "add sections with proper names", create sections with descriptive, professional names
        - When user asks to "add 10 sections", create 10 sections with varied, relevant names
        - Use your knowledge of the test topic to create appropriate section names and content

        If the user intent is unclear, ask clarifying questions, but still return the current full structure in 'test_update'.

        If you do not follow this format, the user will not be able to use your response.
      PROMPT
    }
  end

  # New method to merge optimized response with full test structure
  def self.merge_optimized_response(response_test_update, original_test_update, relevant_sections)
    return response_test_update unless original_test_update&.dig('sections')
    
    # Create a copy of the original structure
    merged_structure = original_test_update.deep_dup
    
    # Update only the relevant sections with the response data
    if response_test_update&.dig('sections')
      response_test_update['sections'].each do |response_section|
        original_index = response_section['_original_index']
        if original_index && merged_structure['sections'][original_index]
          # Merge the section data
          merged_structure['sections'][original_index] = response_section.except('_original_index', '_total_questions')
        end
      end
    end
    
    # Update other fields if provided
    ['title', 'description', 'test_type', 'duration'].each do |field|
      if response_test_update[field]
        merged_structure[field] = response_test_update[field]
      end
    end
    
    merged_structure
  end

  # Main entry point: use this for large texts
  # Returns aggregated structured data from all chunks
  def self.test_api
  uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true

  request = Net::HTTP::Post.new(uri.request_uri, {
    "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
    "Content-Type" => "application/json"
  })

  prompt = "What is 2+2? Respond only with the number."

  request.body = {
    model: "o1", # Try with your model, or a known working one from docs
    messages: [
      { role: "user", content: prompt }
    ]
  }.to_json

  response = http.request(request)
  puts "Status: #{response.code}"
  puts "Body: #{response.body}"
end
  def self.parse_test_content_full(text)
    chunks = chunk_text(text)
    results = []
    chunks.each_with_index do |chunk, idx|
      Rails.logger.info("Processing chunk \\#{idx+1}/\\#{chunks.size}")
      begin
        result = parse_test_content(chunk)
        results << result
      rescue => e
        Rails.logger.error("Chunk \\#{idx+1} failed: \\#{e.message}")
      end
    end
    aggregate_results(results)
  end

  # Splits text into overlapping chunks
  def self.chunk_text(text)
    chunks = []
    i = 0
    while i < text.length
      chunks << text[i, MAX_CHARS]
      i += (MAX_CHARS - OVERLAP)
    end
    chunks
  end

  # Aggregates results from all chunks
  def self.aggregate_results(results)
    all_questions = results.flat_map { |r| r["questions"] rescue [] }
    all_sections = results.flat_map { |r| r["sections"] rescue [] }
    test_info = results.find { |r| r["title"] || r["test"] } || {}
    {
      "test" => test_info["test"] || test_info["title"],
      "sections" => all_sections,
      "questions" => all_questions
    }
  end

  # Processes a single chunk (existing logic, with truncation)
  def self.parse_test_content(text)
    if text.length > MAX_CHARS
      Rails.logger.warn("Input text too long (\\#{text.length} chars), truncating to \\#{MAX_CHARS} chars.")
      text = text[0...MAX_CHARS]
    end

    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    prompt = <<~PROMPT
      Extract test questions from: \\#{text}
    PROMPT

    request.body = {
      model: "o1", # Replace with the appropriate model ID
      messages: [
        { role: "user", content: prompt }
      ]
    }.to_json

    response = http.request(request)
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("AI API request failed: \\#{response.body}")
      raise "Language model API request failed"
    end

    data = JSON.parse(response.body)
    content = data.dig("choices", 0, "message", "content")
    if content.nil? || content.strip.empty?
      Rails.logger.error("AI API returned empty or nil content: \\#{data.inspect}")
      raise "AI API returned empty or invalid content"
    end

    begin
      JSON.parse(content)
    rescue JSON::ParserError => e
      Rails.logger.error("Failed to parse AI response as JSON: \\#{content}")
      raise "AI response was not valid JSON"
    end
  end

  def self.process_file(file)
    # Save uploaded file to temp file
    temp_file = save_uploaded_file(file)
    
    begin
      case File.extname(file.original_filename).downcase
      when '.pdf'
        process_pdf_with_ai(temp_file)
      when '.png', '.jpg', '.jpeg', '.gif'
        process_image_with_ai(temp_file)
      when '.doc', '.docx', '.txt'
        process_document_with_ai(temp_file)
      else
        raise "Unsupported file type: #{File.extname(file.original_filename)}"
      end
    ensure
      # Cleanup temporary files
      temp_file&.close
      temp_file&.unlink
    end
  end

  private

  def self.save_uploaded_file(file)
    temp_file = Tempfile.new(['upload', File.extname(file.original_filename)])
    temp_file.binmode
    temp_file.write(file.read)
    temp_file.rewind
    temp_file
  end

  def self.convert_pdf_page_to_image(pdf_path, page_number)
    image_path = Tempfile.new(['page', '.png']).path
    cmd = "convert -density 300 #{pdf_path}[#{page_number}] -strip -colorspace RGB -quality 100 #{image_path}"
    Rails.logger.info("Converting page #{page_number + 1} to image: #{cmd}")
    
    system(cmd)
    
    if File.exist?(image_path) && File.size(image_path) > 0
      Rails.logger.info("Successfully converted page #{page_number + 1} to image")
      image_path
    else
      Rails.logger.error("Failed to convert page #{page_number + 1} to image")
      nil
    end
  end

  def self.image_to_base64(image_path)
    image_data = File.open(image_path, 'rb') { |f| f.read }
    Base64.strict_encode64(image_data)
  end

  def self.process_pdf_with_ai(pdf_file)
    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300  # 5 minutes timeout
    http.open_timeout = 60   # 1 minute connection timeout

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    # Get total pages
    reader = PDF::Reader.new(pdf_file.path)
    total_pages = [reader.page_count, MAX_PAGES].min
    Rails.logger.info("Processing #{total_pages} pages out of #{reader.page_count} total pages")

    all_questions = []
    all_sections = []
    test_info = nil

    total_pages.times do |page_number|
      Rails.logger.info("Processing page #{page_number + 1}")
      
      # Convert page to image
      image_path = convert_pdf_page_to_image(pdf_file.path, page_number)
      next unless image_path

      begin
        # Convert image to base64
        base64_image = image_to_base64(image_path)
        
        prompt = <<~PROMPT
          You are a test extraction expert. Your task is to carefully analyze this test paper page and extract questions, sections, and test information.

          Important instructions:
          1. Extract EVERY question you can find in this page, including:
             - Multiple choice questions
             - Written answer questions
             - Programming questions
             - Questions with code snippets
             - Questions with diagrams or figures
          2. Pay attention to:
             - Question numbers (e.g., "1.", "2.", etc.)
             - Section headers
             - Question marks
             - Instructions within questions
          3. For multiple choice questions:
             - Include ALL options (A, B, C, D, etc.)
             - Note the correct answer if provided
             - Include any "None of the above" or "All of the above" options
          4. For each question:
             - Note the marks/points
             - Include any sub-questions
             - Include any code snippets or examples
             - Note any special instructions

          You must respond with a valid JSON object in this exact format (do not include any other text or markdown):
          {
            "test": {
              "title": "string",
              "description": "string",
              "test_type": "string",
              "duration": "string",
              "status": "string"
            },
            "sections": [
              {
                "name": "string"
              }
            ],
            "questions": [
              {
                "content": "string",
                "question_type": "string",
                "options": ["string"],
                "correct_answer": "number",
                "marks": "number",
                "tags": ["string"]
              }
            ]
          }
        PROMPT

        request.body = {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a test extraction expert. Your task is to extract questions and test content from the provided test paper page. Be thorough and include every question you can find. Process the content in sequence. Pay special attention to question numbers, marks, and any code snippets or examples. You must respond with a valid JSON object only, no other text or markdown."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: "data:image/png;base64,#{base64_image}"
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
          temperature: 0.3
        }.to_json

        Rails.logger.info("Sending request to OpenAI API for page #{page_number + 1}")
        response = http.request(request)
        
        unless response.is_a?(Net::HTTPSuccess)
          Rails.logger.error("OpenAI API request failed for page #{page_number + 1}: #{response.body}")
          next
        end

        data = JSON.parse(response.body)
        content = data.dig("choices", 0, "message", "content")
        
        if content.nil? || content.strip.empty?
          Rails.logger.error("OpenAI API returned empty content for page #{page_number + 1}")
          next
        end

        # Remove any markdown code block markers and clean the content
        content = content.gsub(/```json\n?|\n?```/, '').strip
        
        # Try to find JSON content within the response
        if content =~ /\{.*\}/
          content = content.match(/\{.*\}/)[0]
        end

        begin
          parsed_content = JSON.parse(content)
          
          # Merge results
          test_info ||= parsed_content["test"]
          all_sections.concat(parsed_content["sections"] || [])
          all_questions.concat(parsed_content["questions"] || [])
          
          Rails.logger.info("Successfully processed page #{page_number + 1}")
        rescue JSON::ParserError => e
          Rails.logger.error("Failed to parse OpenAI response as JSON for page #{page_number + 1}: #{e.message}")
          Rails.logger.error("Raw content: #{content}")
          next
        end
      rescue Net::ReadTimeout => e
        Rails.logger.error("Timeout processing page #{page_number + 1}: #{e.message}")
        next
      rescue => e
        Rails.logger.error("Error processing page #{page_number + 1}: #{e.message}")
        next
      ensure
        # Cleanup temporary image file
        File.delete(image_path) if image_path && File.exist?(image_path)
      end
    end

    # Remove duplicate sections
    all_sections.uniq! { |s| s["name"] }
    
    # Sort questions by their number if possible
    all_questions.sort_by! do |q|
      if q["content"] =~ /^(\d+)\./
        $1.to_i
      else
        999999
      end
    end

    group_questions_by_section(all_sections, all_questions)
  end

  def self.optimize_image(image_path)
    # Create a temporary file for the optimized image
    optimized_path = Tempfile.new(['optimized', '.png']).path
    
    # Optimize the image: reduce size while maintaining quality
    cmd = "convert #{image_path} -strip -resize '2000x2000>' -quality 85 #{optimized_path}"
    Rails.logger.info("Optimizing image: #{cmd}")
    
    # Execute the optimization command
    system(cmd)
    
    if File.exist?(optimized_path) && File.size(optimized_path) > 0
      Rails.logger.info("Successfully optimized image")
      optimized_path
    else
      Rails.logger.error("Failed to optimize image")
      image_path  # Return original if optimization fails
    end
  end

  def self.process_image_with_ai(image_file)
    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300
    http.open_timeout = 60

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    begin
      # Convert image to base64
      base64_image = image_to_base64(image_file.path)
      
      prompt = <<~PROMPT
        You are a test extraction expert. Your task is to carefully analyze this test paper image and extract questions, sections, and test information.

        Important instructions:
        1. Extract EVERY question you can find in this image, including:
           - Multiple choice questions
           - Written answer questions
           - Programming questions
           - Questions with code snippets
           - Questions with diagrams or figures
        2. Pay attention to:
           - Question numbers (e.g., "1.", "2.", etc.)
           - Section headers
           - Question marks
           - Instructions within questions
        3. For multiple choice questions:
           - Include ALL options (A, B, C, D, etc.)
           - Note the correct answer if provided
           - Include any "None of the above" or "All of the above" options
        4. For each question:
           - Note the marks/points
           - Include any sub-questions
           - Include any code snippets or examples
           - Note any special instructions

        You must respond with a valid JSON object in this exact format (do not include any other text or markdown):
        {
          "test": {
            "title": "string",
            "description": "string",
            "test_type": "string",
            "duration": "string",
            "status": "string"
          },
          "sections": [
            {
              "name": "string"
            }
          ],
          "questions": [
            {
              "content": "string",
              "question_type": "string",
              "options": ["string"],
              "correct_answer": "number",
              "marks": "number",
              "tags": ["string"]
            }
          ]
        }
      PROMPT

      request.body = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a test extraction expert. Your task is to extract questions and test content from the provided test paper image. Be thorough and include every question you can find. Process the content in sequence. Pay special attention to question numbers, marks, and any code snippets or examples. You must respond with a valid JSON object only, no other text or markdown."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: "data:image/png;base64,#{base64_image}"
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      }.to_json

      Rails.logger.info("Sending request to AIMLAPI for image processing")
      response = http.request(request)
      
      unless response.is_a?(Net::HTTPSuccess)
        Rails.logger.error("AIMLAPI request failed: #{response.body}")
        return nil
      end

      data = JSON.parse(response.body)
      content = data.dig("choices", 0, "message", "content")
      
      if content.nil? || content.strip.empty?
        Rails.logger.error("AIMLAPI returned empty content")
        return nil
      end

      # Remove any markdown code block markers and clean the content
      content = content.gsub(/```json\n?|\n?```/, '').strip
      
      # Try to find JSON content within the response
      if content =~ /\{.*\}/
        content = content.match(/\{.*\}/)[0]
      end

      parsed_content = JSON.parse(content)
      
      # If you have sections and questions, group them before returning:
      grouped_sections = group_questions_by_section(parsed_content["sections"] || [], parsed_content["questions"] || [])
      { "test" => parsed_content["test"] || {}, "sections" => grouped_sections }
    rescue => e
      Rails.logger.error("Error processing image: #{e.message}")
      nil
    end
  end

  def self.process_document_with_ai(doc_file)
    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300
    http.open_timeout = 60

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    begin
      # Extract text from document based on file type
      content = case File.extname(doc_file.path).downcase
      when '.docx'
        extract_text_from_docx(doc_file.path)
      when '.doc'
        extract_text_from_doc(doc_file.path)
      else
        File.read(doc_file.path)
      end

      if content.nil? || content.strip.empty?
        Rails.logger.error("Failed to extract text from document")
        return nil
      end
      
      prompt = <<~PROMPT
        You are a test extraction expert. Your task is to carefully analyze this test paper document and extract questions, sections, and test information.

        Important instructions:
        1. Extract EVERY question you can find in this document, including:
           - Multiple choice questions
           - Written answer questions
           - Programming questions
           - Questions with code snippets
           - Questions with diagrams or figures
        2. Pay attention to:
           - Question numbers (e.g., "1.", "2.", etc.)
           - Section headers
           - Question marks
           - Instructions within questions
        3. For multiple choice questions:
           - Include ALL options (A, B, C, D, etc.)
           - Note the correct answer if provided
           - Include any "None of the above" or "All of the above" options
        4. For each question:
           - Note the marks/points
           - Include any sub-questions
           - Include any code snippets or examples
           - Note any special instructions

        Document content:
        #{content}

        You must respond with a valid JSON object in this exact format (do not include any other text or markdown):
        {
          "test": {
            "title": "string",
            "description": "string",
            "test_type": "string",
            "duration": "string",
            "status": "string"
          },
          "sections": [
            {
              "name": "string"
            }
          ],
          "questions": [
            {
              "content": "string",
              "question_type": "string",
              "options": ["string"],
              "correct_answer": "number",
              "marks": "number",
              "tags": ["string"]
            }
          ]
        }
      PROMPT

      request.body = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a test extraction expert. Your task is to extract questions and test content from the provided test paper document. Be thorough and include every question you can find. Process the content in sequence. Pay special attention to question numbers, marks, and any code snippets or examples. You must respond with a valid JSON object only, no other text or markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      }.to_json

      Rails.logger.info("Sending request to AIMLAPI for document processing")
      response = http.request(request)
      
      unless response.is_a?(Net::HTTPSuccess)
        Rails.logger.error("AIMLAPI request failed: #{response.body}")
        return nil
      end

      data = JSON.parse(response.body)
      content = data.dig("choices", 0, "message", "content")
      
      if content.nil? || content.strip.empty?
        Rails.logger.error("AIMLAPI returned empty content")
        return nil
      end

      # Remove any markdown code block markers and clean the content
      content = content.gsub(/```json\n?|\n?```/, '').strip
      
      # Try to find JSON content within the response
      if content =~ /\{.*\}/
        content = content.match(/\{.*\}/)[0]
      end

      parsed_content = JSON.parse(content)
      
      # If you have sections and questions, group them before returning:
      grouped_sections = group_questions_by_section(parsed_content["sections"] || [], parsed_content["questions"] || [])
      { "test" => parsed_content["test"] || {}, "sections" => grouped_sections }
    rescue => e
      Rails.logger.error("Error processing document: #{e.message}")
      nil
    end
  end

  def self.extract_text_from_docx(file_path)
    begin
      doc = Docx::Document.open(file_path)
      text = doc.paragraphs.map(&:text).join("\n")
      text.force_encoding('UTF-8')
    rescue => e
      Rails.logger.error("Error extracting text from DOCX: #{e.message}")
      nil
    end
  end

  def self.extract_text_from_doc(file_path)
    begin
      # For .doc files, we'll need to convert to .docx first
      temp_docx = Tempfile.new(['converted', '.docx'])
      cmd = "soffice --headless --convert-to docx --outdir #{File.dirname(temp_docx.path)} #{file_path}"
      system(cmd)
      
      if File.exist?(temp_docx.path)
        text = extract_text_from_docx(temp_docx.path)
        File.delete(temp_docx.path)
        text
      else
        Rails.logger.error("Failed to convert DOC to DOCX")
        nil
      end
    rescue => e
      Rails.logger.error("Error extracting text from DOC: #{e.message}")
      nil
    end
  end

  def self.group_questions_by_section(sections, questions)
    # Assign unique id and empty questions array to each section
    sections_with_ids = sections.each_with_index.map do |section, idx|
      section['id'] ||= "section-#{idx}"
      section['questions'] = []
      
      # Calculate section duration based on questions
      section_questions = questions.select do |q|
        (q['tags'] || []).any? { |tag| section['name'].downcase.include?(tag.downcase) }
      end
      
      # Calculate total duration for this section
      total_duration = section_questions.sum do |q|
        case q['question_type']&.downcase
        when 'mcq'
          3 # 3 minutes per MCQ
        when 'msq'
          5 # 5 minutes per MSQ
        when 'theoretical'
          10 # 10 minutes per theoretical question
        else
          5 # default duration
        end
      end
      
      # Set minimum duration of 15 minutes per section
      section['duration'] = [total_duration, 15].max
      
      # Add questions to section
      section_questions.each do |q|
        section['questions'] << q
        # Set question duration
        q['duration'] = case q['question_type']&.downcase
          when 'mcq'
            3
          when 'msq'
            5
          when 'theoretical'
            10
          else
            5
          end
      end
      
      section
    end

    sections_with_ids
  end

  def self.normalize_duration(value)
    return value if value.is_a?(Integer)
    return value.to_i if value.is_a?(Float)
    
    # Handle string values like "30 minutes", "30 min", "30", etc.
    if value.is_a?(String)
      # Extract the first number from the string
      number = value.to_s[/\d+/]
      return number.to_i if number
    end
    
    # Fallback to 0 if we can't parse the value
    0
  end

  def self.process_test_data(test_data)
    total_test_duration = normalize_duration(test_data['duration'])
    
    # Handle both formats: sections_attributes (hash) and sections (array)
    sections = if test_data['sections_attributes']
      test_data['sections_attributes'].map do |idx, section|
        questions = (section['questions_attributes'] || {}).map do |q_idx, question|
          {
            'question_type' => question['question_type'],
            'content' => question['content'],
            'options' => [
              question['option_1'],
              question['option_2'],
              question['option_3'],
              question['option_4']
            ].reject { |opt| opt == 'undefined' },
            'correct_answer' => question['correct_answer'],
            'marks' => question['marks'].to_i,
            'tags' => question['tags'] == 'undefined' ? [] : [question['tags']],
            'duration' => normalize_duration(question['duration'])
          }
        end
        {
          'name' => section['name'],
          'duration' => normalize_duration(section['duration']),
          'questions' => questions
        }
      end
    else
      (test_data['sections'] || []).map do |section|
        questions = (section['questions'] || []).map do |question|
          question.merge('duration' => normalize_duration(question['duration']))
        end
        section.merge('duration' => normalize_duration(section['duration']), 'questions' => questions)
      end
    end
    
    # Calculate durations for each section if missing or zero
    sections_array = sections.map do |section|
      questions = section['questions'] || []
      base_duration = questions.sum do |q|
        q['duration'].to_i > 0 ? q['duration'].to_i : case q['question_type']&.downcase
          when 'mcq' then 3
          when 'msq' then 5
          when 'theoretical' then 10
          else 5
        end
      end
      section_duration = [base_duration, 15].max
      section.merge('duration' => section_duration, 'questions' => questions)
    end
    
    total_base_duration = sections_array.sum { |s| s['duration'] }
    if total_base_duration < total_test_duration
      remaining_time = total_test_duration - total_base_duration
      sections_array.each do |section|
        proportion = section['duration'].to_f / total_base_duration
        extra_time = (remaining_time * proportion).round
        section['duration'] += extra_time
      end
    end
    
    if test_data['sections_attributes']
      test_data['sections_attributes'] = sections_array.each_with_index.map do |section, idx|
        [idx.to_s, {
          'name' => section['name'],
          'duration' => section['duration'],
          'questions_attributes' => section['questions'].each_with_index.map do |question, q_idx|
            [q_idx.to_s, {
              'content' => question['content'],
              'question_type' => question['question_type'],
              'option_1' => question['options'][0],
              'option_2' => question['options'][1],
              'option_3' => question['options'][2],
              'option_4' => question['options'][3],
              'correct_answer' => question['correct_answer'],
              'marks' => question['marks'].to_s,
              'duration' => normalize_duration(question['duration']),
              'tags' => question['tags'].join(',')
            }]
          end.to_h
        }]
      end.to_h
    else
      test_data['sections'] = sections_array.map do |section|
        {
          'name' => section['name'],
          'duration' => section['duration'],
          'questions' => section['questions'].map do |question|
            question.merge('duration' => normalize_duration(question['duration']))
          end
        }
      end
    end
    
    test_data
  end

  def self.estimate_max_tokens(messages, model_max = 4096)
    # Estimate prompt tokens (very rough: 1 token ≈ 4 chars)
    prompt_tokens = messages.map { |m| m[:content].to_s.length / 4 }.sum
    # Leave at least 10% for the prompt, rest for completion
    [model_max - prompt_tokens, (model_max * 0.8).to_i].max
  end

  # Handles a single chat message and returns both the bot reply and any structured test data
  def self.chat(user_message, conversation: [], latest_test_update: nil)
    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    # Use intelligent context management for large datasets
    context_result = optimize_context_for_large_data(latest_test_update, user_message, conversation)
    messages = context_result[:messages]
    context_type = context_result[:context_type]
    relevant_sections = context_result[:relevant_sections]

    # Log the context type for debugging
    Rails.logger.info("Using context type: #{context_type}")
    if context_type == 'optimized'
      Rails.logger.info("Relevant sections: #{relevant_sections}")
    end

    # Dynamically estimate max_tokens
    model_max_tokens = 4096 # Set to your model's actual max (e.g., 4096, 8192, 128000)
    max_tokens = estimate_max_tokens(messages, model_max_tokens)
    
    # For large datasets, ensure we have enough tokens for the response
    if context_type == 'optimized'
      max_tokens = [max_tokens, 4000].max
      Rails.logger.info("Optimized context detected, increased max_tokens to #{max_tokens}")
    end
    
    # Cap max_tokens to prevent exceeding model limits
    max_tokens = [max_tokens, model_max_tokens - 1000].min

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    request.body = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: max_tokens,
      temperature: 0.3
    }.to_json

    response = http.request(request)
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("AIMLAPI chat request failed: #{response.body}")
      return { reply: "Sorry, something went wrong with the AI service.", test_update: nil }
    end

    data = JSON.parse(response.body)
    content = data.dig("choices", 0, "message", "content")

    Rails.logger.info("Raw AI response: #{content}")

    # Improved JSON parsing with better error handling
    user_message_part = content
    test_update = nil
    ai_message = nil

    # First, try to extract JSON from the response
    if content =~ /\{.*\}/m
      json_str = content.match(/\{.*\}/m)[0]
      Rails.logger.info("Extracted JSON string: #{json_str[0..100]}...")
      
      begin
        parsed = JSON.parse(json_str)
        ai_message = parsed["message"]
        test_update = parsed["test_update"]
        Rails.logger.info("Successfully parsed JSON: message=#{ai_message}, test_update present=#{!test_update.nil?}")
        
        # Handle optimized context response
        if context_type == 'optimized' && test_update && latest_test_update
          Rails.logger.info("Merging optimized response with full test structure")
          test_update = merge_optimized_response(test_update, latest_test_update, relevant_sections)
        end
        
      rescue JSON::ParserError => e
        Rails.logger.error("JSON parse error: #{e.message}")
        Rails.logger.error("Failed JSON string: #{json_str}")
        
        # Improved truncation detection
        looks_truncated = (
          json_str.length > 500 ||
          json_str.strip.end_with?(',', '[', '{') ||
          (json_str.include?('"questions": [') && !json_str.include?(']') && !json_str.include?('}')) ||
          json_str.include?('"question_type":') && !json_str.include?('}') ||
          json_str.strip.end_with?('"')
        )

        if looks_truncated
          Rails.logger.warn("Detected truncated JSON - likely incomplete response")
          # For truncated JSON, we'll use the current test structure and provide a fallback message
          ai_message = "The response was incomplete due to large data size. Please try your request again with a more specific modification or break it into smaller changes."
          test_update = context_type == 'optimized' ? latest_test_update : nil
        else
          # Fallback: try to fix common issues and parse again
          fixed = json_str
          fixed = fixed.gsub(/,\s*}/, '}').gsub(/,\s*\]/, ']') # Remove trailing commas
          fixed = fixed.gsub(/\n/, ' ').gsub(/\s+/, ' ') # Remove newlines and extra spaces
          fixed = fixed.gsub(/```json\n?|\n?```/, '') # Remove code block markers
          fixed = fixed.gsub(/^json\n/, '') # Remove "json" prefix
          
          Rails.logger.info("Attempting to parse fixed JSON: #{fixed[0..100]}...")
          begin
            parsed = JSON.parse(fixed)
            ai_message = parsed["message"]
            test_update = parsed["test_update"]
            Rails.logger.info("Successfully parsed fixed JSON: message=#{ai_message}, test_update present=#{!test_update.nil?}")
            
            # Handle optimized context response
            if context_type == 'optimized' && test_update && latest_test_update
              Rails.logger.info("Merging optimized response with full test structure")
              test_update = merge_optimized_response(test_update, latest_test_update, relevant_sections)
            end
            
          rescue JSON::ParserError => e2
            Rails.logger.error("Fixed JSON also failed: #{e2.message}")
            ai_message = nil
            test_update = context_type == 'optimized' ? latest_test_update : nil
          end
        end
      end
      
      # Clean up the user message part
      if ai_message
        user_message_part = ai_message
      else
        # Remove the JSON part from the content and clean it up
        user_message_part = content.sub(/\{.*\}/m, '').strip
        user_message_part = user_message_part.gsub(/```json\n?|\n?```/, '').strip
        user_message_part = user_message_part.gsub(/^json\n/, '').strip
      end
    end

    # If the message is empty but test_update is present, provide a default summary
    if (user_message_part.nil? || user_message_part.empty?) && test_update
      user_message_part = "Test updated successfully."
    end

    # If the message is still just JSON, replace with a generic message
    if user_message_part.strip.start_with?('{') && test_update
      user_message_part = "Test updated successfully."
    end

    # If both message and test_update are missing, provide a fallback
    if (user_message_part.nil? || user_message_part.empty?) && test_update.nil?
      user_message_part = "Sorry, I couldn't process your request. Please try again."
    end

    # Log the final result
    Rails.logger.info("Final result: message=#{user_message_part}, test_update present=#{!test_update.nil?}")

    result = { reply: user_message_part, test_update: test_update }
    result
  end

  # Chat method that allows partial responses (for child jobs)
  def self.chat_with_partial_prompt(user_message, conversation: [], latest_test_update: nil)
    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    # Use intelligent context management for large datasets
    context_result = optimize_context_for_large_data(latest_test_update, user_message, conversation)
    messages = context_result[:messages]
    context_type = context_result[:context_type]
    relevant_sections = context_result[:relevant_sections]

    # Override system prompt for partial responses
    messages = messages.map do |msg|
      if msg[:role] == "system"
        create_partial_system_prompt
      else
        msg
      end
    end

    # Log the context type for debugging
    Rails.logger.info("Using context type: #{context_type} (partial prompt)")
    if context_type == 'optimized'
      Rails.logger.info("Relevant sections: #{relevant_sections}")
    end

    # Dynamically estimate max_tokens
    model_max_tokens = 4096
    max_tokens = estimate_max_tokens(messages, model_max_tokens)
    
    # For large datasets, ensure we have enough tokens for the response
    if context_type == 'optimized'
      max_tokens = [max_tokens, 4000].max
      Rails.logger.info("Optimized context detected, increased max_tokens to #{max_tokens}")
    end
    
    # Cap max_tokens to prevent exceeding model limits
    max_tokens = [max_tokens, model_max_tokens - 1000].min

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    request.body = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: max_tokens,
      temperature: 0.3
    }.to_json

    response = http.request(request)
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("AIMLAPI chat request failed: #{response.body}")
      return { reply: "Sorry, something went wrong with the AI service.", test_update: nil }
    end

    data = JSON.parse(response.body)
    content = data.dig("choices", 0, "message", "content")

    Rails.logger.info("Raw AI response (partial): #{content}")

    # Parse the response - for partial prompts, we expect only section data
    test_update = nil
    ai_message = nil

    # First, try to extract JSON from the response
    if content =~ /\{.*\}/m
      json_str = content.match(/\{.*\}/m)[0]
      Rails.logger.info("Extracted JSON string (partial): #{json_str[0..100]}...")
      
      begin
        parsed = JSON.parse(json_str)
        
        # For partial responses, we expect either a single section or a test_update with sections
        if parsed["name"] && parsed["questions"]
          # Single section response
          ai_message = "Section updated successfully"
          test_update = { "sections" => [parsed] }
        elsif parsed["test_update"]
          # Full test_update response (fallback)
          ai_message = parsed["message"]
          test_update = parsed["test_update"]
        else
          # Unknown format
          ai_message = "Section processed"
          test_update = { "sections" => [parsed] } if parsed["questions"]
        end
        
        Rails.logger.info("Successfully parsed partial JSON: message=#{ai_message}, test_update present=#{!test_update.nil?}")
        
      rescue JSON::ParserError => e
        Rails.logger.error("JSON parse error (partial): #{e.message}")
        Rails.logger.error("Failed JSON string: #{json_str}")
        ai_message = "Failed to parse response"
        test_update = nil
      end
    else
      ai_message = content
      test_update = nil
    end

    # If the message is empty, provide a default summary
    if (ai_message.nil? || ai_message.empty?) && test_update
      ai_message = "Section updated successfully."
    end

    # If both message and test_update are missing, provide a fallback
    if (ai_message.nil? || ai_message.empty?) && test_update.nil?
      ai_message = "Sorry, I couldn't process your request. Please try again."
    end

    # Log the final result
    Rails.logger.info("Final partial result: message=#{ai_message}, test_update present=#{!test_update.nil?}")

    { reply: ai_message, test_update: test_update }
  end

  # Create system prompt for partial responses
  def self.create_partial_system_prompt
    {
      role: "system",
      content: <<~PROMPT
        You are a test section modification assistant. You help modify specific sections of existing tests.

        CRITICAL INSTRUCTIONS:
        - You are working on a SINGLE section of an existing test
        - Return ONLY the section data as a JSON object
        - Do NOT return the complete test structure
        - Do NOT modify other sections
        - Do NOT create new sections unless explicitly requested
        - Keep questions concise and focused (2-3 sentences maximum)
        - Limit to 5 questions per section to prevent truncation

        JSON FORMAT (MANDATORY):
        {
          "name": "Section Name",
          "duration": 60,
          "questions": [
            {
              "question_type": "MCQ|MSQ|theoretical",
              "content": "string",
              "options": ["string"], // for MCQ/MSQ
              "correct_answer": "string", // for MCQ
              "correct_answers": ["string"], // for MSQ
              "marks": number,
              "duration": "number" // time in minutes as integer for this question
            }
          ]
        }

        IMPORTANT RULES:
        1. Return ONLY the section JSON object, nothing else
        2. Do NOT use code block markers (```json ... ```)
        3. Do NOT use markdown formatting
        4. Do NOT add explanatory text before or after the JSON
        5. Do NOT return the complete test structure
        6. Focus only on the requested section
        7. Keep questions concise to avoid truncation

        For each question type:
        - MCQ: Must have exactly 4 options and one correct answer
        - MSQ: Must have 4-6 options and multiple correct answers
        - Theoretical: No options needed, just content and marks

        If you do not follow this format, the section modification will fail.
      PROMPT
    }
  end

  # Directly generate a test from a description, expecting only JSON in the response
  def self.generate_test_from_description(description)
    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    system_prompt = {
      role: "system",
      content: <<~PROMPT
        You are a test generation expert. You must respond with a valid JSON object only, no other text or markdown. The JSON should include: title, description, test_type, duration, and sections. Each section must have a duration and questions. Each question must have appropriate options based on its type and a duration.

        Example format:
        {
          "title": "Java Developer Hiring Test",
          "description": "This test evaluates Java programming skills",
          "test_type": "Technical Assessment",
          "duration": "120 minutes",
          "sections": [
            {
              "name": "Core Java Concepts",
              "duration": 30,
              "questions": [
                {
                  "question_type": "MCQ",
                  "content": "What is the size of an int variable in Java?",
                  "options": [
                    "2 bytes",
                    "4 bytes",
                    "8 bytes",
                    "Depends on the platform"
                  ],
                  "correct_answer": "B",
                  "marks": 2,
                  "duration": 3
                },
                {
                  "question_type": "theoretical",
                  "content": "Explain the concept of inheritance in Java.",
                  "marks": 5,
                  "duration": 10
                }
              ]
            }
          ]
        }

        For each question type:
        - MCQ: Must have exactly 4 options and one correct answer (A, B, C, or D)
        - MSQ: Must have 4-6 options and multiple correct answers
        - Theoretical: No options needed, just content and marks
        
        Each section and question must have a duration specified as an integer representing minutes.
      PROMPT
    }

    messages = [
      system_prompt,
      { role: "user", content: description }
    ]

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    request.body = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: 4000,
      temperature: 0.3
    }.to_json

    response = http.request(request)
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("AIMLAPI test generation request failed: #{response.body}")
      return nil
    end

    data = JSON.parse(response.body)
    content = data.dig("choices", 0, "message", "content")
    content = content.gsub(/```json\n?|\n?```/, '').strip

    parsed_content = JSON.parse(content) rescue nil
    parsed_content
  end

  def self.add_questions_in_batches(test_state, questions_per_section, user_message_template = nil)
    test_state = test_state.deep_dup
    test_state['sections'].each_with_index do |section, idx|
      while section['questions'].size < questions_per_section
        needed = questions_per_section - section['questions'].size
        batch = [needed, BATCH_SIZE].min
        # Build a user message for the AI
        user_message = if user_message_template
          user_message_template.gsub('{section}', section['name']).gsub('{count}', batch.to_s)
        else
          "Add #{batch} more questions to the section '#{section['name']}' based on its topic."
        end
        # Call the AI chat logic with the current test state and user message
        ai_result = self.chat(user_message, [], test_state)
        new_test_update = ai_result[:test_update]
        # Defensive: extract new questions for this section
        new_section = (new_test_update['sections'] || [])[idx] rescue nil
        new_questions = new_section ? new_section['questions'][section['questions'].size..-1] : []
        break if new_questions.nil? || new_questions.empty? # Prevent infinite loop
        section['questions'].concat(new_questions)
        # Optionally: log progress
        Rails.logger.info("Added #{new_questions.size} questions to section '#{section['name']}'. Now has #{section['questions'].size}/#{questions_per_section}.")
      end
    end
    test_state
  end

  # Handle JSON file uploads for large test structures
  def self.process_json_file(file_content, user_message = nil)
    uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300
    http.open_timeout = 60

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    # Parse the JSON file content
    begin
      json_data = JSON.parse(file_content)
      Rails.logger.info("Successfully parsed JSON file with #{json_data['sections']&.length || 0} sections")
    rescue JSON::ParserError => e
      Rails.logger.error("Failed to parse JSON file: #{e.message}")
      return { reply: "Invalid JSON file format. Please check your file and try again.", test_update: nil }
    end

    # Create a more focused prompt for JSON processing
    system_prompt = {
      role: "system",
      content: <<~PROMPT
        You are a test structure processor. You receive JSON test data and user requests to modify it.
        
        CRITICAL INSTRUCTIONS:
        - Process the provided JSON test structure
        - Apply the user's requested modifications
        - Return ONLY a valid JSON object with 'message' and 'test_update' fields
        - NEVER use code block markers (```json ... ```)
        - NEVER add explanatory text before or after the JSON
        - Return ONLY the JSON object, nothing else
        
        JSON FORMAT (MANDATORY):
        {
          "message": "A short summary of what changed",
          "test_update": {
            "title": "string",
            "description": "string", 
            "test_type": "string",
            "duration": "string",
            "sections": [
              {
                "name": "string",
                "duration": "number",
                "questions": [
                  {
                    "question_type": "MCQ|MSQ|theoretical",
                    "content": "string",
                    "options": ["string"],
                    "correct_answer": "string",
                    "correct_answers": ["string"],
                    "marks": number,
                    "duration": "number"
                  }
                ]
              }
            ]
          }
        }
      PROMPT
    }

    # Prepare the user message with the JSON data
    user_content = "Current test structure:\n#{JSON.pretty_generate(json_data)}\n\nUser request: #{user_message || 'Please process this test structure.'}"

    messages = [
      system_prompt,
      { role: "user", content: user_content }
    ]

    # Use a higher token limit for file processing
    max_tokens = 4000

    request.body = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: max_tokens,
      temperature: 0.2
    }.to_json

    response = http.request(request)
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("AIMLAPI JSON processing request failed: #{response.body}")
      return { reply: "Sorry, something went wrong with the AI service.", test_update: nil }
    end

    data = JSON.parse(response.body)
    content = data.dig("choices", 0, "message", "content")

    Rails.logger.info("Raw AI response for JSON processing: #{content[0..200]}...")

    # Parse the response using the same logic as chat method
    user_message_part = content
    test_update = nil
    ai_message = nil

    if content =~ /\{.*\}/m
      json_str = content.match(/\{.*\}/m)[0]
      Rails.logger.info("Extracted JSON string: #{json_str[0..100]}...")
      
      begin
        parsed = JSON.parse(json_str)
        ai_message = parsed["message"]
        test_update = parsed["test_update"]
        Rails.logger.info("Successfully parsed JSON: message=#{ai_message}, test_update present=#{!test_update.nil?}")
      rescue JSON::ParserError => e
        Rails.logger.error("JSON parse error: #{e.message}")
        
        # Improved truncation detection
        looks_truncated = (
          json_str.length > 500 ||
          json_str.strip.end_with?(',', '[', '{') ||
          (json_str.include?('"questions": [') && !json_str.include?(']') && !json_str.include?('}')) ||
          json_str.include?('"question_type":') && !json_str.include?('}') ||
          json_str.strip.end_with?('"')
        )

        if looks_truncated
          Rails.logger.warn("Detected truncated JSON - likely incomplete response")
          ai_message = "The response was incomplete. Please try your request again with fewer questions or a simpler modification."
          test_update = nil
        else
          # Fallback: try to fix common issues and parse again
          fixed = json_str
          fixed = fixed.gsub(/,\s*}/, '}').gsub(/,\s*\]/, ']')
          fixed = fixed.gsub(/\n/, ' ').gsub(/\s+/, ' ')
          fixed = fixed.gsub(/```json\n?|\n?```/, '')
          fixed = fixed.gsub(/^json\n/, '')
          
          Rails.logger.info("Attempting to parse fixed JSON: #{fixed[0..100]}...")
          begin
            parsed = JSON.parse(fixed)
            ai_message = parsed["message"]
            test_update = parsed["test_update"]
            Rails.logger.info("Successfully parsed fixed JSON: message=#{ai_message}, test_update present=#{!test_update.nil?}")
          rescue JSON::ParserError => e2
            Rails.logger.error("Fixed JSON also failed: #{e2.message}")
            ai_message = nil
            test_update = nil
          end
        end
      end
      
      if ai_message
        user_message_part = ai_message
      else
        user_message_part = content.sub(/\{.*\}/m, '').strip
        user_message_part = user_message_part.gsub(/```json\n?|\n?```/, '').strip
        user_message_part = user_message_part.gsub(/^json\n/, '').strip
      end
    end

    # Ensure we always have a valid reply message
    user_message_part ||= "Test updated successfully."
    test_update ||= nil

    Rails.logger.info("Final JSON processing result: message=#{user_message_part}, test_update present=#{!test_update.nil?}")
    
    { reply: user_message_part, test_update: test_update }
  end

  # Export test structure to JSON file
  def self.export_test_to_json(test_structure)
    {
      title: test_structure['title'] || 'Test Export',
      description: test_structure['description'] || '',
      test_type: test_structure['test_type'] || 'Technical',
      duration: test_structure['duration'] || '60',
      sections: test_structure['sections'] || [],
      export_date: Time.current.iso8601,
      version: '1.0'
    }.to_json
  end

  # Import test structure from JSON file
  def self.import_test_from_json(json_content)
    begin
      data = JSON.parse(json_content)
      
      # Validate the structure
      unless data['sections'] && data['sections'].is_a?(Array)
        return { success: false, error: "Invalid test structure: missing or invalid sections" }
      end
      
      # Clean and validate each section
      cleaned_sections = data['sections'].map do |section|
        next unless section['name'] && section['questions']
        
        {
          name: section['name'],
          duration: section['duration'] || 15,
          questions: section['questions'].select { |q| q['content'] && q['question_type'] }
        }
      end.compact
      
      if cleaned_sections.empty?
        return { success: false, error: "No valid sections found in the JSON file" }
      end
      
      {
        success: true,
        test_update: {
          title: data['title'] || 'Imported Test',
          description: data['description'] || '',
          test_type: data['test_type'] || 'Technical',
          duration: data['duration'] || '60',
          sections: cleaned_sections
        }
      }
    rescue JSON::ParserError => e
      { success: false, error: "Invalid JSON format: #{e.message}" }
    rescue => e
      { success: false, error: "Error processing file: #{e.message}" }
    end
  end
end

# Usage:
# For large files, call AiParserService.parse_test_content_full(text)
# For small files, you can still use AiParserService.parse_test_content(text)
# app/services/ai_mock_test_generator_service.rb
require 'net/http'
require 'uri'
require 'json'

class AiMockTestGeneratorService
  API_ENDPOINT = "https://api.aimlapi.com/v1/chat/completions"
  TIMEOUT = 120 # 2 minutes timeout
  
  # Test API connection (following AiParserService pattern)
  def self.test_api
    uri = URI.parse(API_ENDPOINT)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
      "Content-Type" => "application/json"
    })

    prompt = "What is 2+2? Respond only with the number."

    request.body = {
      model: "gpt-4o",
      messages: [
        { role: "user", content: prompt }
      ]
    }.to_json

    response = http.request(request)
    puts "Status: #{response.code}"
    puts "Body: #{response.body}"
    
    response.is_a?(Net::HTTPSuccess)
  end
  
  def initialize(user)
    @user = user
    @api_key = ENV['AIMLAPI_KEY']
    raise "AIMLAPI_KEY not configured" unless @api_key
  end

  # Generate mock tests for all leaf categories
  def generate_all_mock_tests
    puts "🚀 Starting AI Mock Test Generation for all leaf categories..."
    
    leaf_categories = Category.leaf_categories.includes(:test_domain, :parent, :master_questions)
    
    puts "📊 Found #{leaf_categories.count} leaf categories"
    
    results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }
    
    leaf_categories.each_with_index do |category, index|
      puts "\n[#{index + 1}/#{leaf_categories.count}] Processing: #{category.name}"
      
      begin
        result = generate_mock_test_for_category(category)
        if result[:success]
          results[:success] += 1
          puts "✅ Success: Created test '#{result[:test_title]}'"
        else
          results[:skipped] += 1
          puts "⏭️  Skipped: #{result[:reason]}"
        end
      rescue => e
        results[:failed] += 1
        error_msg = "Failed to generate test for #{category.name}: #{e.message}"
        results[:errors] << error_msg
        puts "❌ #{error_msg}"
        Rails.logger.error error_msg
      end
    end
    
    puts "\n" + "=" * 60
    puts "🎉 AI Mock Test Generation Complete!"
    puts "✅ Success: #{results[:success]}"
    puts "⏭️  Skipped: #{results[:skipped]}"
    puts "❌ Failed: #{results[:failed]}"
    
    if results[:errors].any?
      puts "\n📋 Errors:"
      results[:errors].each { |error| puts "  - #{error}" }
    end
    
    results
  end

  # Generate mock test for a specific category
  def generate_mock_test_for_category(category, question_count = 10)
    # Skip if category already has questions
    if category.master_questions.any?
      return { success: false, reason: "Category already has #{category.master_questions.count} questions" }
    end
    
    # Validate question count
    question_count = [question_count.to_i, 20].min # Max 20 questions
    question_count = [question_count, 5].max # Min 5 questions
    
    # Get category context
    category_context = build_category_context(category)
    
    # Generate questions using AI
    questions_data = generate_questions_with_ai(category, category_context, question_count)
    
    return { success: false, reason: "Failed to generate questions" } unless questions_data
    
    # Create test from generated questions
    test = create_test_from_questions(category, questions_data)
    
    { success: true, test_title: test.title, test_id: test.id }
  end

  private

  def build_category_context(category)
    # Build full category path
    full_path = category.full_path.map(&:name).join(" > ")
    
    # Get parent categories for context
    parent_names = category.ancestors.map(&:name)
    
    {
      category_name: category.name,
      full_path: full_path,
      test_domain: category.test_domain.name,
      parent_categories: parent_names,
      depth: category.depth
    }
  end

  def generate_questions_with_ai(category, context, question_count = 10)
    uri = URI.parse(API_ENDPOINT)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = TIMEOUT
    http.open_timeout = 60

    request = Net::HTTP::Post.new(uri.request_uri, {
      "Authorization" => "Bearer #{@api_key}",
      "Content-Type" => "application/json"
    })

    prompt = build_question_generation_prompt(category, context, question_count)

    request.body = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert test question generator. Generate high-quality multiple choice questions based on the category context provided. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3
    }.to_json

    Rails.logger.info "Sending AI request for category: #{category.name}"
    response = http.request(request)
    
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error "AI API request failed: #{response.body}"
      raise "AI API request failed: #{response.code}"
    end

    data = JSON.parse(response.body)
    content = data.dig("choices", 0, "message", "content")
    
    if content.nil? || content.strip.empty?
      Rails.logger.error "AI API returned empty content"
      return nil
    end

    Rails.logger.info "Raw AI response: #{content}"

    # Improved JSON parsing with better error handling (following AiParserService pattern)
    parsed_content = nil

    # First, try to extract JSON from the response
    if content =~ /\{.*\}/m
      json_str = content.match(/\{.*\}/m)[0]
      Rails.logger.info "Extracted JSON string: #{json_str[0..100]}..."
      
      begin
        parsed_content = JSON.parse(json_str)
        Rails.logger.info "Successfully parsed JSON for category: #{category.name}"
        
      rescue JSON::ParserError => e
        Rails.logger.error "JSON parse error: #{e.message}"
        Rails.logger.error "Failed JSON string: #{json_str}"
        
        # Improved truncation detection
        looks_truncated = (
          json_str.length > 500 ||
          json_str.strip.end_with?(',', '[', '{') ||
          (json_str.include?('"questions": [') && !json_str.include?(']') && !json_str.include?('}')) ||
          json_str.include?('"question_type":') && !json_str.include?('}') ||
          json_str.strip.end_with?('"')
        )

        if looks_truncated
          Rails.logger.warn "Detected truncated JSON for category: #{category.name}"
          return nil
        else
          # Fallback: try to fix common issues and parse again
          fixed = json_str
          fixed = fixed.gsub(/,\s*}/, '}').gsub(/,\s*\]/, ']') # Remove trailing commas
          fixed = fixed.gsub(/\n/, ' ').gsub(/\s+/, ' ') # Remove newlines and extra spaces
          fixed = fixed.gsub(/```json\n?|\n?```/, '') # Remove code block markers
          fixed = fixed.gsub(/^json\n/, '') # Remove "json" prefix
          
          Rails.logger.info "Attempting to parse fixed JSON: #{fixed[0..100]}..."
          begin
            parsed_content = JSON.parse(fixed)
            Rails.logger.info "Successfully parsed fixed JSON for category: #{category.name}"
            
          rescue JSON::ParserError => e2
            Rails.logger.error "Fixed JSON also failed: #{e2.message}"
            return nil
          end
        end
      end
    else
      Rails.logger.error "No JSON found in response for category: #{category.name}"
      return nil
    end

    # Validate and structure the response
    validate_and_structure_questions(parsed_content, category)
  rescue => e
    Rails.logger.error "Error generating questions for #{category.name}: #{e.message}"
    nil
  end

  def build_question_generation_prompt(category, context, question_count)
    # Determine the type of questions based on category
    question_type = determine_question_type(category, context)
    
    <<~PROMPT
      Generate #{question_count} high-quality, SPECIFIC multiple choice questions for: "#{context[:category_name]}"
      
      Category Context:
      - Full Path: #{context[:full_path]}
      - Test Domain: #{context[:test_domain]}
      - Parent Categories: #{context[:parent_categories].join(" > ")}
      - Depth Level: #{context[:depth]}
      
      CRITICAL REQUIREMENTS:
      1. Generate EXACTLY #{question_count} questions
      2. Each question MUST be SPECIFIC to the category content, NOT generic
      3. Questions should test actual knowledge and understanding of the subject
      4. Avoid generic questions like "What is the main objective of studying [subject]?"
      5. Focus on concrete concepts, facts, procedures, and applications
      6. Each question should have 4 options (A, B, C, D)
      7. Include one correct answer per question (index 0-3)
      8. Mix difficulty levels: #{[(question_count * 0.3).round, 1].max} easy, #{[(question_count * 0.5).round, 1].max} medium, #{[(question_count * 0.2).round, 1].max} hard
      9. Use clear, concise language
      10. Ensure questions are educational and test real understanding
      
      Question Type Guidelines:
      #{question_type}
      
      Response Format (JSON only):
      {
        "test_title": "Mock Test: #{context[:category_name]}",
        "test_description": "Comprehensive mock test covering #{context[:category_name]} concepts and applications",
        "questions": [
          {
            "content": "Specific question about actual #{context[:category_name]} content?",
            "options": ["Specific option A", "Specific option B", "Specific option C", "Specific option D"],
            "correct_answer": "0",
            "marks": 5,
            "code_snippet": null,
            "explanation": "Brief explanation of why this is correct"
          }
        ]
      }
      
      IMPORTANT: Make questions SPECIFIC to the actual subject matter, not generic study objectives!
    PROMPT
  end

  def determine_question_type(category, context)
    category_name = context[:category_name].downcase
    test_domain = context[:test_domain].downcase
    
    case
    when category_name.include?('python') || category_name.include?('programming') || category_name.include?('coding')
      <<~GUIDE
        - Include code snippets where relevant
        - Test syntax, logic, algorithms, and problem-solving
        - Questions about specific Python functions, libraries, or concepts
        - Debugging scenarios and code analysis
      GUIDE
    when category_name.include?('react') || category_name.include?('javascript') || category_name.include?('frontend')
      <<~GUIDE
        - Test React components, hooks, state management
        - JavaScript concepts, ES6+ features
        - DOM manipulation, event handling
        - Code snippets for component behavior
      GUIDE
    when category_name.include?('java') || category_name.include?('oop')
      <<~GUIDE
        - Test Java syntax, OOP concepts, inheritance, polymorphism
        - Collections, exceptions, threading
        - Code analysis and debugging
        - Design patterns and best practices
      GUIDE
    when category_name.include?('sql') || category_name.include?('database')
      <<~GUIDE
        - SQL queries, joins, subqueries, aggregations
        - Database design, normalization
        - Performance optimization
        - Data manipulation and analysis
      GUIDE
    when category_name.include?('algebra') || category_name.include?('mathematics')
      <<~GUIDE
        - Mathematical concepts, formulas, calculations
        - Problem-solving with equations
        - Mathematical proofs and logic
        - Real-world applications of algebra
      GUIDE
    when category_name.include?('biology') || category_name.include?('chemistry') || category_name.include?('physics')
      <<~GUIDE
        - Scientific concepts, processes, and mechanisms
        - Experimental procedures and lab techniques
        - Data interpretation and analysis
        - Real-world applications and case studies
      GUIDE
    when category_name.include?('geography') || category_name.include?('civics') || category_name.include?('history')
      <<~GUIDE
        - Historical events, dates, and significance
        - Geographic features, climate, and human geography
        - Political systems, governance, and civic responsibilities
        - Case studies and real-world examples
      GUIDE
    when category_name.include?('neet') || category_name.include?('medical') || category_name.include?('jee')
      <<~GUIDE
        - Exam-specific concepts and topics
        - Previous year question patterns
        - Application-based questions
        - Time management and exam strategies
      GUIDE
    else
      <<~GUIDE
        - Focus on core concepts and principles
        - Test practical applications and problem-solving
        - Include real-world scenarios and case studies
        - Emphasize critical thinking and analysis
      GUIDE
    end
  end

  def validate_and_structure_questions(parsed_content, category)
    # Validate required fields
    unless parsed_content['questions']&.is_a?(Array)
      Rails.logger.error "Invalid response: questions array missing"
      return nil
    end

    questions = parsed_content['questions']
    
    # Validate each question
    valid_questions = questions.select do |q|
      q['content'].present? &&
      q['options'].is_a?(Array) && q['options'].length == 4 &&
      q['correct_answer'].present? &&
      q['marks'].present? &&
      q['correct_answer'].to_i.between?(0, 3) # Ensure correct_answer is a valid index
    end

    if valid_questions.empty?
      Rails.logger.error "No valid questions found in AI response"
      return nil
    end

    # Structure the response
    {
      test_title: parsed_content['test_title'] || "Mock Test: #{category.name}",
      test_description: parsed_content['test_description'] || "Comprehensive mock test for #{category.name}",
      questions: valid_questions
    }
  end

  def create_test_from_questions(category, questions_data)
    ActiveRecord::Base.transaction do
      # Create the test
      test = Test.create!(
        title: questions_data[:test_title],
        description: questions_data[:test_description],
        user: @user,
        test_type: "mock",
        total_marks: questions_data[:questions].sum { |q| q['marks'] || 5 },
        duration: 30, # Default 30 minutes
        status: 'draft'
      )

      # Create section
      section = test.sections.create!(
        name: category.name,
        duration: 30
      )

      # Create questions and master questions
      questions_data[:questions].each_with_index do |q_data, index|
        # Convert correct_answer index to option number (1-4)
        correct_answer_index = q_data['correct_answer'].to_i
        
        # Validate correct_answer_index
        unless correct_answer_index.between?(0, 3)
          Rails.logger.error "Invalid correct_answer_index: #{correct_answer_index} for question #{index + 1}"
          raise "Invalid correct_answer_index: #{correct_answer_index}"
        end
        
        # Convert 0-based index to 1-based option number
        correct_answer_option = (correct_answer_index + 1).to_s
        
        # Create master question
        master_question = MasterQuestion.create!(
          content: q_data['content'],
          code_snippet: q_data['code_snippet'],
          option_1: q_data['options'][0],
          option_2: q_data['options'][1],
          option_3: q_data['options'][2],
          option_4: q_data['options'][3],
          correct_answer: correct_answer_option,
          language: 'English',
          question_type: 'MCQ',
          marks: q_data['marks'] || 5,
          slug: "#{category.slug}-ai-generated-#{index + 1}",
          category_id: category.id
        )

        # Create test question
        section.questions.create!(
          test_id: test.id,
          content: q_data['content'],
          marks: q_data['marks'] || 5,
          question_type: 'MCQ',
          correct_answer: correct_answer_option,
          option_1: q_data['options'][0],
          option_2: q_data['options'][1],
          option_3: q_data['options'][2],
          option_4: q_data['options'][3]
        )
      end

      # Create notification
      Notification.create!(
        user: @user,
        message: "AI-generated mock test '#{test.title}' created successfully with #{questions_data[:questions].count} questions.",
        notifiable: test
      )

      test
    end
  end
end 
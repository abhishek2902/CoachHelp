class AiTaskJob < ApplicationJob
  queue_as :default

  # Helper method to properly merge test states
  def merge_test_states(existing_state, new_state)
    # Guard: If new_state is blank, empty, or has no sections, do not overwrite
    if new_state.blank? || new_state == {}
      Rails.logger.warn("[DEFENSIVE MERGE] Skipping update: new_state is blank. Existing state preserved.")
      Rails.logger.warn("[DEFENSIVE MERGE] Call stack: #{caller.join("\n")}")
      return existing_state
    end
    
    # Handle case where new_state is a single section (from child jobs)
    if new_state['name'] && new_state['questions']
      Rails.logger.info("Detected single section update for: #{new_state['name']}")
      # Convert single section to proper test_update format
      new_state = { 'sections' => [new_state] }
    end
    Rails.logger.info("Merging test states:")
    Rails.logger.info("Existing state: #{existing_state.inspect}")
    Rails.logger.info("New state: #{new_state.inspect}")
    
    merged_state = existing_state.deep_dup || {}
    
    # Merge metadata fields - only update if new state has non-empty, non-blank values
    %w[title description test_type duration].each do |field|
      if new_state[field].present? && new_state[field].to_s.strip != ''
        merged_state[field] = new_state[field]
        Rails.logger.info("Updated #{field}: #{new_state[field]}")
      end
    end
    
    # Merge sections properly (unchanged)
    if new_state['sections'].present?
      existing_sections = merged_state['sections'] || []
      new_sections = new_state['sections']
      
      # Create a map of existing sections by name for easy lookup
      existing_sections_map = existing_sections.index_by { |s| s['name'] }
      
      new_sections.each do |new_section|
        section_name = new_section['name']
        existing_section = existing_sections_map[section_name]
        
        if existing_section
          # Section exists - merge questions and update duration if provided
          Rails.logger.info("Merging into existing section: #{section_name}")
          existing_questions = existing_section['questions'] || []
          new_questions = new_section['questions'] || []
          
          # Add new questions to existing ones (avoid duplicates by checking content)
          existing_question_contents = existing_questions.map { |q| q['content'] }.compact
          new_questions.each do |new_question|
            unless existing_question_contents.include?(new_question['content'])
              existing_questions << new_question
              Rails.logger.info("Added new question to #{section_name}: #{new_question['content'][0..50]}...")
            end
          end
          
          existing_section['questions'] = existing_questions
          existing_section['duration'] = new_section['duration'] if new_section['duration'].present?
        else
          # New section - add it
          Rails.logger.info("Adding new section: #{section_name}")
          existing_sections << new_section
        end
      end
      
      merged_state['sections'] = existing_sections
    end
    
    Rails.logger.info("Merged state: #{merged_state.inspect}")
    merged_state
  end

  # Add a helper for logging test_state updates
  def log_test_state_update(context, data)
    Rails.logger.info("[TEST_STATE_UPDATE] Context: #{context}")
    Rails.logger.info("[TEST_STATE_UPDATE] Data: #{data.inspect}")
    Rails.logger.info("[TEST_STATE_UPDATE] Call stack: #{caller.join("\n")}")
  end

  # Check if all child jobs are completed and update parent status
  def check_and_update_parent_status(parent_task_id)
    parent_task = AiTask.find(parent_task_id)
    children = AiTask.where(parent_id: parent_task_id)
    
    return unless children.any?
    
    completed_children = children.where(status: [:done, :failed, :cancelled]).count
    total_children = children.count
    
    # Update parent task with progress
    current_result = begin
      JSON.parse(parent_task.result || '{}')
    rescue JSON::ParserError
      {}
    end
    
    current_result['completed_children'] = completed_children
    current_result['total_children'] = total_children
    
    # Check if all children are done
    if completed_children == total_children
      failed_children = children.where(status: :failed).count
      if failed_children > 0
        parent_task.update!(
          status: :failed,
          error: "#{failed_children} out of #{total_children} child jobs failed",
          result: current_result.to_json
        )
      else
        parent_task.update!(
          status: :done,
          result: current_result.to_json
        )
        
        # Add final completion message to chat
        ChatMessage.create!(
          user_id: parent_task.user_id,
          conversation_id: parent_task.conversation_id,
          bot_reply: "All sections processed successfully!",
          ai_task_ids: [parent_task.id]
        )
      end
    else
      # Update progress
      parent_task.update!(result: current_result.to_json)
    end
  end

  # Process a child job (for individual section processing)
  def process_child_job(ai_task)
    Rails.logger.info("Processing child job for task ID: #{ai_task.id}")
    
    # Token pre-check for child job processing
    wallet = UserWallet.find_or_create_by(user: ai_task.user)
    wallet.token_balance ||= 0
    child_token_cost = 15 # Cost for individual section processing
    if wallet.token_balance < child_token_cost
      ai_task.update!(status: :failed, error: "Insufficient tokens for child job processing")
      return
    end
    
    begin
      # Handle both string and JSON payload formats
      payload = if ai_task.request_payload.is_a?(String)
        begin
          JSON.parse(ai_task.request_payload)
        rescue JSON::ParserError
          # If it's not JSON, treat it as a plain message
          { message: ai_task.request_payload }
        end
      else
        ai_task.request_payload
      end
      
      message = payload['message'] || ''
      section_name = payload['section_name'] || 'Unknown Section'
      use_partial_prompt = payload['use_partial_prompt'] || false
      
      # Get the test state
      test_state = ConversationTestState.find_by(conversation_id: ai_task.conversation_id, user_id: ai_task.user_id)
      
      if test_state
        test_state.reload
        Rails.logger.info("Processing section: #{section_name}")
        
        # Process the section
        if use_partial_prompt
          # Use a special method for child jobs that allows partial responses
          result = AiParserService.chat_with_partial_prompt(message, latest_test_update: test_state.test_state)
        else
          result = AiParserService.chat(message, latest_test_update: test_state.test_state)
        end
        
        if result.is_a?(Hash) && result[:test_update]
          merged_state = merge_test_states(test_state.test_state, result[:test_update])
          log_test_state_update('merge_test_states', merged_state)
          test_state.update!(test_state: merged_state)
          Rails.logger.info("Updated test state for section #{section_name}")
        elsif result.is_a?(Hash) && result[:reply]
          # Handle case where AI returns only a single section
          begin
            # Try to parse the reply as a single section
            section_data = JSON.parse(result[:reply])
            if section_data['name'] && section_data['questions']
              Rails.logger.info("Detected single section response for: #{section_data['name']}")
              merged_state = merge_test_states(test_state.test_state, section_data)
              log_test_state_update('merge_test_states', merged_state)
              test_state.update!(test_state: merged_state)
              Rails.logger.info("Updated test state for single section #{section_name}")
            end
          rescue JSON::ParserError => e
            Rails.logger.warn("Failed to parse single section response: #{e.message}")
            # Continue with normal processing
          end
        end
        
        ai_text = result[:message] || result[:reply] || "Questions added to section #{section_name}"
        Rails.logger.info("Section '#{section_name}': #{ai_text}")
        
        # Store AI response in chat messages
        ChatMessage.create!(
          user_id: ai_task.user_id,
          conversation_id: ai_task.conversation_id,
          bot_reply: ai_text,
          ai_task_ids: [ai_task.id]
        )
        
        ai_task.update!(status: :done, result: { message: ai_text, section: section_name }.to_json)
        
        # Deduct tokens for successful child job processing
        ActiveRecord::Base.transaction do
          wallet.token_balance -= child_token_cost
          wallet.save!
          
          TokenTransaction.create!(
            user: ai_task.user,
            conversation: ai_task.conversation,
            amount: -child_token_cost,
            source: 'ai_task_child',
            meta: { 
              message: message,
              section_name: section_name,
              ai_task_id: ai_task.id,
              parent_id: ai_task.parent_id
            }
          )
        end
        
        # Check if parent task should be updated
        if ai_task.parent_id
          check_and_update_parent_status(ai_task.parent_id)
        end
      else
        raise "Test state not found for conversation #{ai_task.conversation_id}"
      end
    rescue => e
      Rails.logger.error("Error processing child job #{ai_task.id}: #{e.message}")
      Rails.logger.error("Backtrace: #{e.backtrace.join("\n")}")
      ai_task.update!(status: :failed, error: e.message)
      
      # Check if parent task should be updated even on failure
      if ai_task.parent_id
        check_and_update_parent_status(ai_task.parent_id)
      end
    end
  end

  def perform(ai_task_id)
    Rails.logger.info("AiTaskJob starting for task ID: #{ai_task_id}")
    ai_task = AiTask.find(ai_task_id)
    Rails.logger.info("AI task found: #{ai_task.inspect}")
    Rails.logger.info("Request payload: #{ai_task.request_payload}")
    ai_task.update!(status: :processing)
    
    # Token pre-check for AI task processing
    wallet = UserWallet.find_or_create_by(user: ai_task.user)
    wallet.token_balance ||= 0
    task_token_cost = 25 # Higher cost for batch processing
    if wallet.token_balance < task_token_cost
      ai_task.update!(status: :failed, error: "Insufficient tokens for AI task processing")
      return
    end
    
    # Check if this is a child job (has a parent)
    if ai_task.parent_id.present?
      Rails.logger.info("This is a child job with parent ID: #{ai_task.parent_id}")
      process_child_job(ai_task)
      return
    end
    
    # This is a parent job - continue with normal processing
    Rails.logger.info("This is a parent job - processing batch request")
    
    begin
      # Handle both string and JSON payload formats
      payload = if ai_task.request_payload.is_a?(String)
        begin
          JSON.parse(ai_task.request_payload)
        rescue JSON::ParserError
          # If it's not JSON, treat it as a plain message
          { message: ai_task.request_payload }
        end
      else
        ai_task.request_payload
      end
      
      message = payload['message'] || ''
      sections = payload['sections'] || []
      job_name = payload['job_name'] || "Job #{ai_task_id}"
      
      # Always get the test state object first and ensure we have the latest data
      test_state = ConversationTestState.find_by(conversation_id: ai_task.conversation_id, user_id: ai_task.user_id)
      
      if test_state
        # Force reload to get the latest data from database
        test_state.reload
        Rails.logger.info("Test state found and reloaded. ID: #{test_state.id}")
        Rails.logger.info("Test state data: #{test_state.test_state.inspect}")
      else
        Rails.logger.info("No test state found, creating new one")
        test_state = ConversationTestState.create!(
          conversation_id: ai_task.conversation_id,
          user_id: ai_task.user_id,
          test_state: ConversationTestState.default_test_state
        )
      end
      
      current_test_update = test_state.test_state || {}
      current_sections = current_test_update['sections'] || []
      
      Rails.logger.info("Processing AI task: message=#{message}, current_sections_count=#{current_sections.length}")
      Rails.logger.info("Current sections: #{current_sections.map { |s| s['name'] }.inspect}")
      
      # Debug: Log the exact message being processed
      Rails.logger.info("DEBUG: Processing message: '#{message}'")
      Rails.logger.info("DEBUG: Message length: #{message.length}")
      Rails.logger.info("DEBUG: Message contains 'add': #{message.downcase.include?('add')}")
      Rails.logger.info("DEBUG: Message contains 'questions': #{message.downcase.include?('questions')}")
      Rails.logger.info("DEBUG: Message contains 'section': #{message.downcase.include?('section')}")
      
      # Enhanced batch add sections and questions detection (robust natural language)
      batch_sections_questions_match = message.match(/(?:add|create)\s*(\d+)\s*(new\s*)?sections?\s*(with|and)?\s*(add|create)?\s*(\d+)\s*(mcq|msq|theoretical)?\s*questions?/i)
      
      # Also detect requests to add questions to existing sections (more flexible)
      add_questions_to_sections_match = message.match(/(?:add|create)\s*(\d+)\s*(mcq|msq|theoretical)?\s*questions?\s*(?:to|in|for)\s*(?:the\s+)?(?:existing\s+)?sections?/i)
      
      Rails.logger.info("DEBUG: Testing add_questions_to_sections_match pattern against message: #{message}")
      Rails.logger.info("DEBUG: add_questions_to_sections_match result: #{add_questions_to_sections_match ? 'MATCH' : 'NO MATCH'}")
      
      if batch_sections_questions_match
        num_sections = batch_sections_questions_match[1].to_i
        num_questions = batch_sections_questions_match[5].to_i
        question_type = batch_sections_questions_match[6]&.upcase
        Rails.logger.info("Detected batch request: add #{num_sections} new sections with #{num_questions} questions each (type: #{question_type || 'any'})")
        
        # Step 1: Create sections only
        create_sections_prompt = "Create #{num_sections} new sections with proper names for this test. Do NOT add any questions yet."
        create_sections_result = AiParserService.chat(create_sections_prompt, latest_test_update: test_state.test_state)
        if create_sections_result.is_a?(Hash) && create_sections_result[:test_update]
          merged_test_state = merge_test_states(test_state.test_state, create_sections_result[:test_update])
          log_test_state_update('merge_test_states', merged_test_state)
          test_state.update!(test_state: merged_test_state)
          current_sections = merged_test_state['sections']
          ai_text = create_sections_result[:message] || create_sections_result[:reply] || "Sections created."
          ChatMessage.create!(
            user_id: ai_task.user_id,
            conversation_id: ai_task.conversation_id,
            bot_reply: ai_text
          )
        else
          Rails.logger.error("Failed to create sections via AI. Aborting batch add questions.")
          ai_task.update!(status: :failed, error: "Failed to create sections before adding questions.")
          return
        end
        
        # Step 2: Create child jobs for each new section
        new_sections = current_sections.last(num_sections)
        child_task_ids = []
        
        new_sections.each do |section|
          section_prompt = "Add #{num_questions}#{question_type ? " #{question_type}" : ""} questions to the section '#{section['name']}' in the current test structure."
          child_task = AiTask.create!(
            conversation_id: ai_task.conversation_id,
            user_id: ai_task.user_id,
            status: :pending,
            request_payload: { message: section_prompt, section_name: section['name'] }.to_json,
            parent_id: ai_task.id
          )
          child_task_ids << child_task.id
          # Enqueue the child job
          AiTaskJob.perform_later(child_task.id)
        end
        
        # Update parent task with child task IDs and mark as processing
        ai_task.update!(
          status: :processing,
          result: { 
            message: "Created #{num_sections} sections. Processing #{num_questions} questions per section...",
            child_task_ids: child_task_ids,
            total_children: child_task_ids.length,
            completed_children: 0
          }.to_json
        )
        
        # Store the initial response in chat
        ChatMessage.create!(
          user_id: ai_task.user_id,
          conversation_id: ai_task.conversation_id,
          bot_reply: "Created #{num_sections} new sections. Adding #{num_questions} questions to each section...",
          ai_task_ids: [ai_task.id] + child_task_ids
        )
        
        # Deduct tokens for parent task (child tasks will deduct their own tokens)
        ActiveRecord::Base.transaction do
          wallet.token_balance -= task_token_cost
          wallet.save!
          
          TokenTransaction.create!(
            user: ai_task.user,
            conversation: ai_task.conversation,
            amount: -task_token_cost,
            source: 'ai_task_parent',
            meta: { 
              message: message,
              ai_task_id: ai_task.id,
              child_task_ids: child_task_ids
            }
          )
        end
        
        return
      elsif add_questions_to_sections_match && !current_sections.empty?
        # Handle requests to add questions to existing sections
        num_questions = add_questions_to_sections_match[1].to_i
        # Limit to prevent truncation issues
        num_questions = [num_questions, 5].min
        question_type = add_questions_to_sections_match[2]&.upcase
        Rails.logger.info("Detected request to add #{num_questions} questions to existing sections (type: #{question_type || 'any'}) - limited to prevent truncation")
        
        # Create child jobs for each existing section - run sequentially
        child_task_ids = []
        current_sections.each_with_index do |section, idx|
          section_prompt = "IMPORTANT: You have an existing test with sections. I want you to add #{num_questions}#{question_type ? " #{question_type}" : ""} questions to the EXISTING section named '#{section['name']}'. Do NOT create new sections. Do NOT modify other sections. Only add questions to the section '#{section['name']}'. Keep questions concise and focused. Return ONLY a JSON object with the section data like this: {\"name\": \"#{section['name']}\", \"duration\": #{section['duration']}, \"questions\": [question1, question2, ...]}. Do NOT return the complete test structure. Limit each question to 2-3 sentences maximum."
          child_task = AiTask.create!(
            conversation_id: ai_task.conversation_id,
            user_id: ai_task.user_id,
            status: :pending,
            request_payload: { message: section_prompt, section_name: section['name'], use_partial_prompt: true }.to_json,
            parent_id: ai_task.id
          )
          child_task_ids << child_task.id
          
          # Process child job immediately and wait for completion before creating the next one
          Rails.logger.info("Processing child job #{child_task.id} for section '#{section['name']}' (#{idx + 1}/#{current_sections.length})")
          AiTaskJob.perform_now(child_task.id)
          Rails.logger.info("Completed child job #{child_task.id} for section '#{section['name']}'")
        end
        
        # Update parent task with child task IDs and mark as processing
        ai_task.update!(
          status: :processing,
          result: { 
            message: "Adding #{num_questions} questions to each of #{current_sections.length} existing sections...",
            child_task_ids: child_task_ids,
            total_children: child_task_ids.length,
            completed_children: 0
          }.to_json
        )
        
        # Store the initial response in chat
        ChatMessage.create!(
          user_id: ai_task.user_id,
          conversation_id: ai_task.conversation_id,
          bot_reply: "Adding #{num_questions} questions to each existing section...",
          ai_task_ids: [ai_task.id] + child_task_ids
        )
        
        # Deduct tokens for parent task (child tasks will deduct their own tokens)
        ActiveRecord::Base.transaction do
          wallet.token_balance -= task_token_cost
          wallet.save!
          
          TokenTransaction.create!(
            user: ai_task.user,
            conversation: ai_task.conversation,
            amount: -task_token_cost,
            source: 'ai_task_parent',
            meta: { 
              message: message,
              ai_task_id: ai_task.id,
              child_task_ids: child_task_ids
            }
          )
        end
        
        return
      end
      
      # Enhanced batch add questions detection - more flexible patterns
      batch_patterns = [
        /add\s+(\d+)\s+questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
        /add\s+(\d+)\s+(mcq|msq|theoretical)?\s*questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
        /create\s+(\d+)\s+questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
        /add\s+(\d+)\s+questions?\s+per\s+section/i,
        /(\d+)\s+questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
        # Additional patterns for more natural language
        /add\s+(\d+)\s+questions?\s+to\s+(?:all|each|every)\s+sections?/i,
        /add\s+(\d+)\s+(mcq|msq|theoretical)?\s*questions?\s+to\s+(?:all|each|every)\s+sections?/i,
        /create\s+(\d+)\s+questions?\s+for\s+(?:all|each|every)\s+sections?/i,
        /(\d+)\s+questions?\s+per\s+(?:section|sections?)/i,
        /add\s+(\d+)\s+questions?\s+(?:across|in)\s+all\s+sections?/i,
        # Pattern for specific section creation with question counts
        /create\s+a\s+test\s+(?:for|about)\s+.*?\s+(\d+)\s+sections?\s+(.*?)\s+(\d+)\s+questions?\s+(.*?)\s+(\d+)\s+questions?/i
      ]
      
      batch_match = nil
      num_questions = nil
      question_type = nil
      
      batch_match = nil
      num_questions = nil
      question_type = nil
      specific_sections_data = nil
      
      batch_patterns.each do |pattern|
        match = message.match(pattern)
        Rails.logger.info("DEBUG: Testing pattern #{pattern.inspect} against message: #{message}")
        Rails.logger.info("DEBUG: Pattern match result: #{match ? 'MATCH' : 'NO MATCH'}")
        if match
          batch_match = match
          
          # Check if this is the specific section creation pattern
          if pattern.to_s.include?('create\\s+a\\s+test\\s+(?:for|about)')
            # This is the specific section creation pattern
            num_sections = match[1].to_i
            section1_name = match[2]&.strip || 'Unknown Section 1'
            section1_questions = match[3].to_i
            section2_name = match[4]&.strip || 'Unknown Section 2'
            section2_questions = match[5].to_i
            
            Rails.logger.info("DEBUG: Extracted section data from pattern:")
            Rails.logger.info("  num_sections: #{num_sections}")
            Rails.logger.info("  section1_name: '#{section1_name}'")
            Rails.logger.info("  section1_questions: #{section1_questions}")
            Rails.logger.info("  section2_name: '#{section2_name}'")
            Rails.logger.info("  section2_questions: #{section2_questions}")
            
            specific_sections_data = {
              sections: [
                { name: section1_name, questions: [section1_questions, 5].min },
                { name: section2_name, questions: [section2_questions, 5].min }
              ]
            }
            
            Rails.logger.info("Detected specific section creation pattern")
            Rails.logger.info("Sections: #{specific_sections_data[:sections].inspect}")
          else
            # Regular batch pattern
            num_questions = match[1].to_i
            # Limit to prevent truncation issues
            num_questions = [num_questions, 5].min
            question_type = match[2]&.upcase if match[2]
            Rails.logger.info("Detected batch add questions pattern: #{pattern.inspect}")
            Rails.logger.info("Extracted: #{num_questions} questions, type: #{question_type || 'any'} - limited to prevent truncation")
          end
          break
        end
      end
      
      if specific_sections_data
        Rails.logger.info("Processing specific section creation with question counts")
        
        # Create the test structure with specific sections
        sections_data = specific_sections_data[:sections]
        create_test_prompt = "Create a test with exactly #{sections_data.length} sections: #{sections_data.map { |s| s['name'] || 'Unknown Section' }.join(' and ')}. Do NOT add any questions yet. Just create the test structure with these sections."
        
        create_test_result = AiParserService.chat(create_test_prompt, latest_test_update: test_state.test_state)
        if create_test_result.is_a?(Hash) && create_test_result[:test_update]
          # Merge new test structure into existing state
          merged_test_state = merge_test_states(test_state.test_state, create_test_result[:test_update])
          log_test_state_update('merge_test_states', merged_test_state)
          test_state.update!(test_state: merged_test_state)
          current_sections = merged_test_state['sections']
          
          ai_text = create_test_result[:message] || create_test_result[:reply] || "Test structure created."
          ChatMessage.create!(
            user_id: ai_task.user_id,
            conversation_id: ai_task.conversation_id,
            bot_reply: ai_text
          )
          
          # Create child jobs for each specific section with their question counts
          child_task_ids = []
          Rails.logger.info("Looking for sections: #{sections_data.map { |s| s['name'] }.inspect}")
          Rails.logger.info("Available sections: #{current_sections.map { |s| s['name'] }.inspect}")
          
          sections_data.each_with_index do |section_data, idx|
            Rails.logger.info("Looking for section: '#{section_data['name']}'")
            section = current_sections.find { |s| s['name']&.downcase&.include?(section_data['name']&.downcase) }
            if section
              Rails.logger.info("Found matching section: '#{section['name']}'")
              section_prompt = "IMPORTANT: You have an existing test with sections. I want you to add #{section_data['questions']} questions to the EXISTING section named '#{section['name'] || 'Unknown Section'}'. Do NOT create new sections. Do NOT modify other sections. Only add questions to the section '#{section['name'] || 'Unknown Section'}'. Keep questions concise and focused. Return ONLY a JSON object with the section data like this: {\"name\": \"#{section['name'] || 'Unknown Section'}\", \"duration\": #{section['duration'] || 60}, \"questions\": [question1, question2, ...]}. Do NOT return the complete test structure. Limit each question to 2-3 sentences maximum."
              child_task = AiTask.create!(
                conversation_id: ai_task.conversation_id,
                user_id: ai_task.user_id,
                status: :pending,
                request_payload: { message: section_prompt, section_name: section['name'] || 'Unknown Section', use_partial_prompt: true }.to_json,
                parent_id: ai_task.id
              )
              child_task_ids << child_task.id
              
              # Process child job immediately and wait for completion before creating the next one
              Rails.logger.info("Processing child job #{child_task.id} for section '#{section['name'] || 'Unknown Section'}' with #{section_data['questions']} questions (#{idx + 1}/#{sections_data.length})")
              AiTaskJob.perform_now(child_task.id)
              Rails.logger.info("Completed child job #{child_task.id} for section '#{section['name'] || 'Unknown Section'}'")
            else
              Rails.logger.warn("Could not find matching section for '#{section_data['name']}'. Available sections: #{current_sections.map { |s| s['name'] }.inspect}")
              # Try to find a section by index as fallback
              if current_sections[idx]
                fallback_section = current_sections[idx]
                Rails.logger.info("Using fallback section by index: '#{fallback_section['name']}'")
                section_prompt = "IMPORTANT: You have an existing test with sections. I want you to add #{section_data['questions']} questions to the EXISTING section named '#{fallback_section['name'] || 'Unknown Section'}'. Do NOT create new sections. Do NOT modify other sections. Only add questions to the section '#{fallback_section['name'] || 'Unknown Section'}'. Keep questions concise and focused. Return ONLY a JSON object with the section data like this: {\"name\": \"#{fallback_section['name'] || 'Unknown Section'}\", \"duration\": #{fallback_section['duration'] || 60}, \"questions\": [question1, question2, ...]}. Do NOT return the complete test structure. Limit each question to 2-3 sentences maximum."
                child_task = AiTask.create!(
                  conversation_id: ai_task.conversation_id,
                  user_id: ai_task.user_id,
                  status: :pending,
                  request_payload: { message: section_prompt, section_name: fallback_section['name'] || 'Unknown Section', use_partial_prompt: true }.to_json,
                  parent_id: ai_task.id
                )
                child_task_ids << child_task.id
                
                # Process child job immediately and wait for completion before creating the next one
                Rails.logger.info("Processing fallback child job #{child_task.id} for section '#{fallback_section['name'] || 'Unknown Section'}' with #{section_data['questions']} questions (#{idx + 1}/#{sections_data.length})")
                AiTaskJob.perform_now(child_task.id)
                Rails.logger.info("Completed fallback child job #{child_task.id} for section '#{fallback_section['name'] || 'Unknown Section'}'")
              end
            end
          end
          
          # Update parent task with child task IDs and mark as done
          ai_task.update!(
            status: :done,
            result: { 
              message: "Created test with #{sections_data.length} sections and added questions to each section.",
              child_task_ids: child_task_ids,
              total_children: child_task_ids.length,
              completed_children: child_task_ids.length
            }.to_json
          )
          
          # Store the final response in chat
          ChatMessage.create!(
            user_id: ai_task.user_id,
            conversation_id: ai_task.conversation_id,
            bot_reply: "Created test with #{sections_data.length} sections and added questions to each section.",
            ai_task_ids: [ai_task.id] + child_task_ids
          )
          
          # Deduct tokens for parent task (child tasks will deduct their own tokens)
          ActiveRecord::Base.transaction do
            wallet.token_balance -= task_token_cost
            wallet.save!
            
            TokenTransaction.create!(
              user: ai_task.user,
              conversation: ai_task.conversation,
              amount: -task_token_cost,
              source: 'ai_task_parent',
              meta: { 
                message: message,
                ai_task_id: ai_task.id,
                child_task_ids: child_task_ids
              }
            )
          end
          
          return
        else
          Rails.logger.error("Failed to create test structure via AI. Aborting specific section creation.")
          ai_task.update!(status: :failed, error: "Failed to create test structure before adding questions.")
          return
        end
      elsif batch_match
        Rails.logger.info("Processing batch add questions request: #{num_questions} questions per section")
        
        if current_sections.empty?
          Rails.logger.info("No sections found. Creating default sections before adding questions.")
          create_sections_prompt = "IMPORTANT: Create 5 new sections with proper names for a #{test_state&.test_state&.dig('title') || 'technical'} test. These should be NEW sections that don't exist yet. Return the complete test structure with these new sections added."
          create_sections_result = AiParserService.chat(create_sections_prompt, latest_test_update: test_state.test_state)
          if create_sections_result.is_a?(Hash) && create_sections_result[:test_update]
            # Merge new sections into existing test state using proper merge function
            merged_test_state = merge_test_states(test_state.test_state, create_sections_result[:test_update])
            log_test_state_update('merge_test_states', merged_test_state)
            test_state.update!(test_state: merged_test_state)
            current_sections = merged_test_state['sections']
            ai_text = create_sections_result[:message] || create_sections_result[:reply] || "Sections created."
            ChatMessage.create!(
              user_id: ai_task.user_id,
              conversation_id: ai_task.conversation_id,
              bot_reply: ai_text
            )
          else
            Rails.logger.error("Failed to create sections via AI. Aborting batch add questions.")
            ai_task.update!(status: :failed, error: "Failed to create sections before adding questions.")
            return
          end
        end
        
        # Create child jobs for each section - run sequentially
        child_task_ids = []
        current_sections.each_with_index do |section, idx|
          section_prompt = "IMPORTANT: You have an existing test with sections. I want you to add #{num_questions}#{question_type ? " #{question_type}" : ""} questions to the EXISTING section named '#{section['name']}'. Do NOT create new sections. Do NOT modify other sections. Only add questions to the section '#{section['name']}'. Keep questions concise and focused. Return ONLY a JSON object with the section data like this: {\"name\": \"#{section['name']}\", \"duration\": #{section['duration']}, \"questions\": [question1, question2, ...]}. Do NOT return the complete test structure. Limit each question to 2-3 sentences maximum."
          child_task = AiTask.create!(
            conversation_id: ai_task.conversation_id,
            user_id: ai_task.user_id,
            status: :pending,
            request_payload: { message: section_prompt, section_name: section['name'], use_partial_prompt: true }.to_json,
            parent_id: ai_task.id
          )
          child_task_ids << child_task.id
          
          # Process child job immediately and wait for completion before creating the next one
          Rails.logger.info("Processing child job #{child_task.id} for section '#{section['name']}' (#{idx + 1}/#{current_sections.length})")
          AiTaskJob.perform_now(child_task.id)
          Rails.logger.info("Completed child job #{child_task.id} for section '#{section['name']}'")
        end
        
        # Update parent task with child task IDs and mark as processing
        ai_task.update!(
          status: :processing,
          result: { 
            message: "Adding #{num_questions} questions to each of #{current_sections.length} sections...",
            child_task_ids: child_task_ids,
            total_children: child_task_ids.length,
            completed_children: 0
          }.to_json
        )
        
        # Store the initial response in chat
        ChatMessage.create!(
          user_id: ai_task.user_id,
          conversation_id: ai_task.conversation_id,
          bot_reply: "Adding #{num_questions} questions to each section...",
          ai_task_ids: [ai_task.id] + child_task_ids
        )
        
        # Deduct tokens for parent task (child tasks will deduct their own tokens)
        ActiveRecord::Base.transaction do
          wallet.token_balance -= task_token_cost
          wallet.save!
          
          TokenTransaction.create!(
            user: ai_task.user,
            conversation: ai_task.conversation,
            amount: -task_token_cost,
            source: 'ai_task_parent',
            meta: { 
              message: message,
              ai_task_id: ai_task.id,
              child_task_ids: child_task_ids
            }
          )
        end
        
        return
      elsif current_sections.empty?
        # For requests without existing sections (like creating new sections)
        Rails.logger.info("Handling request without existing sections")
        result = AiParserService.chat(message, latest_test_update: test_state.test_state)
        Rails.logger.info("AI result: #{result.inspect}")
        ai_task.update!(status: :done, result: result.to_json)
        
        # Update test state if AI returned a test_update
        if result.is_a?(Hash) && result[:test_update]
          Rails.logger.info("Updating test state with AI response")
          # Use proper merge function to merge the AI response with existing state
          merged_state = merge_test_states(test_state.test_state, result[:test_update])
          log_test_state_update('merge_test_states', merged_state)
          test_state.update!(test_state: merged_state)
          Rails.logger.info("Updated test state for new sections")
        end
        
        # Store AI response in chat messages
        ai_text = if result.is_a?(Hash)
          result[:message] || result[:reply] || "Request completed successfully"
        else
          result.to_s
        end
        
        Rails.logger.info("Storing AI response: #{ai_text}")
        ChatMessage.create!(
          user_id: ai_task.user_id,
          conversation_id: ai_task.conversation_id,
          bot_reply: ai_text,
          ai_task_ids: [ai_task.id]
        )
      else
        # For requests with existing sections, check if this is a large request that needs chunked processing
        Rails.logger.info("Handling request with existing sections")
        
        # Check if this is a large request (many sections or many questions)
        total_existing_questions = current_sections.sum { |s| s['questions']&.length || 0 }
        estimated_new_questions = message.downcase.include?('question') ? 5 : 0  # Rough estimate
        
        if current_sections.length > 5 || total_existing_questions + estimated_new_questions > 20
          Rails.logger.info("Large request detected: #{current_sections.length} sections, #{total_existing_questions} existing questions. Using chunked processing.")
          
          # Use chunked processing for large requests
          child_task_ids = []
          current_sections.each_with_index do |section, idx|
            # Create a focused prompt for each section
            section_prompt = "IMPORTANT: You have an existing test with sections. The user request is: '#{message}'. Focus ONLY on the section named '#{section['name'] || 'Unknown Section'}'. Process this request for this specific section only. Do NOT modify other sections. Return ONLY a JSON object with the section data like this: {\"name\": \"#{section['name'] || 'Unknown Section'}\", \"duration\": #{section['duration'] || 60}, \"questions\": [question1, question2, ...]}. Do NOT return the complete test structure. Keep questions concise and focused (2-3 sentences maximum)."
            
            child_task = AiTask.create!(
              conversation_id: ai_task.conversation_id,
              user_id: ai_task.user_id,
              status: :pending,
              request_payload: { message: section_prompt, section_name: section['name'] || 'Unknown Section', use_partial_prompt: true }.to_json,
              parent_id: ai_task.id
            )
            child_task_ids << child_task.id
            
            # Process child job immediately and wait for completion before creating the next one
            Rails.logger.info("Processing chunked child job #{child_task.id} for section '#{section['name'] || 'Unknown Section'}' (#{idx + 1}/#{current_sections.length})")
            AiTaskJob.perform_now(child_task.id)
            Rails.logger.info("Completed chunked child job #{child_task.id} for section '#{section['name'] || 'Unknown Section'}'")
          end
          
          # Update parent task with child task IDs and mark as done
          ai_task.update!(
            status: :done,
            result: { 
              message: "Processed large request using chunked processing across #{current_sections.length} sections.",
              child_task_ids: child_task_ids,
              total_children: child_task_ids.length,
              completed_children: child_task_ids.length
            }.to_json
          )
          
          # Store the final response in chat
          ChatMessage.create!(
            user_id: ai_task.user_id,
            conversation_id: ai_task.conversation_id,
            bot_reply: "Processed your request using chunked processing to handle the large dataset. Each section was processed individually to ensure complete results.",
            ai_task_ids: [ai_task.id] + child_task_ids
          )
          
          # Deduct tokens for parent task (child tasks will deduct their own tokens)
          ActiveRecord::Base.transaction do
            wallet.token_balance -= task_token_cost
            wallet.save!
            
            TokenTransaction.create!(
              user: ai_task.user,
              conversation: ai_task.conversation,
              amount: -task_token_cost,
              source: 'ai_task_parent',
              meta: { 
                message: message,
                ai_task_id: ai_task.id,
                child_task_ids: child_task_ids
              }
            )
          end
          
          return
        else
          # For smaller requests, use the original approach
          Rails.logger.info("Small request detected: #{current_sections.length} sections, #{total_existing_questions} existing questions. Using single processing.")
          
          # Ask AI how to process this request with existing sections
          processing_prompt = "IMPORTANT: You have an existing test with #{current_sections.length} sections: #{current_sections.map { |s| s['name'] || 'Unknown Section' }.join(', ')}. The user request is: '#{message}'. Process this request by working with the EXISTING sections. Do NOT create new sections unless explicitly requested. Return the complete updated test structure with all existing sections and questions intact."
          
          result = AiParserService.chat(processing_prompt, latest_test_update: test_state.test_state)
          Rails.logger.info("AI processing result: #{result.inspect}")
          
          ai_task.update!(status: :done, result: result.to_json)
          
          # Update test state if AI returned a test_update
          if result.is_a?(Hash) && result[:test_update]
            Rails.logger.info("Updating test state with AI response")
            # Use proper merge function to merge the AI response with existing state
            merged_state = merge_test_states(test_state.test_state, result[:test_update])
            log_test_state_update('merge_test_states', merged_state)
            test_state.update!(test_state: merged_state)
            Rails.logger.info("Updated test state for existing sections")
          end
          
          # Store AI response in chat messages
          ai_text = if result.is_a?(Hash)
            result[:message] || result[:reply] || "Request processed successfully"
          else
            result.to_s
          end
          
          ChatMessage.create!(
            user_id: ai_task.user_id,
            conversation_id: ai_task.conversation_id,
            bot_reply: ai_text,
            ai_task_ids: [ai_task.id]
          )
        end
      end
    rescue => e
      Rails.logger.error("Error in AiTaskJob: #{e.message}")
      Rails.logger.error("Backtrace: #{e.backtrace.join("\n")}")
      ai_task.update!(status: :failed, error: e.message)
    end
  end
end 
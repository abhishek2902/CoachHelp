require 'httparty'
require 'net/http'
require 'digest'

module Api
  module V1
    class AiConversationController < ApplicationController
      before_action :authenticate_user!

      # POST /api/v1/ai_conversation/:id/ai_task
      def create_ai_task
        Rails.logger.info("create_ai_task called with params: #{params.inspect}")
        conversation = Conversation.find(params[:id])
        user_message = params[:message].to_s.strip
        payload = JSON.parse(user_message) rescue { 'message' => user_message }
        sections = payload['sections'] || []
        
        Rails.logger.info("Processing AI task: user_message=#{user_message}, sections_count=#{sections.length}")
        
        # Store user message
        ChatMessage.create!(
          user_id: current_user.id,
          conversation_id: conversation.id,
          user_message: user_message
        )
        
        # Create a single AI task and let the AI handle everything dynamically
        parent_task = AiTask.create!(
          conversation: conversation,
          user: current_user,
          status: :pending,
          request_payload: payload.to_json
        )
        AiTaskJob.perform_later(parent_task.id)
        Rails.logger.info("Created AI task with ID: #{parent_task.id}")
        render json: { parent_task_id: parent_task.id, job_ids: [parent_task.id], status: 'queued' }
      end

      # POST /api/v1/ai_tasks/:id/cancel
      def cancel_ai_task
        ai_task = AiTask.find(params[:id])
        ai_task.update!(status: :cancelled)
        render json: { status: 'cancelled' }
      end

      # GET /api/v1/ai_conversation/:id/ai_tasks
      def list_ai_tasks
        conversation = Conversation.find(params[:id])
        all_tasks = []
        
        # Get all AI tasks for this conversation
        ai_tasks = conversation.ai_tasks.order(:created_at)
        
        if ai_tasks.any?
          # Group tasks by parent (or create single task groups)
          task_groups = {}
          
          ai_tasks.each do |task|
            if task.parent_id.nil?
              # This is a parent task or standalone task
              task_groups[task.id] = {
                parent_id: task.id,
                children: []
              }
            else
              # This is a child task
              task_groups[task.parent_id] ||= {
                parent_id: task.parent_id,
                children: []
              }
              task_groups[task.parent_id][:children] << {
                id: task.id,
                status: task.status,
                result: task.result,
                error: task.error,
                job_name: extract_job_name(task)
              }
            end
          end
          
          # Handle standalone tasks (tasks without children)
          ai_tasks.where(parent_id: nil).each do |task|
            if task_groups[task.id][:children].empty?
              # This is a standalone task, treat it as a child of itself
              task_groups[task.id][:children] = [{
                id: task.id,
                status: task.status,
                result: task.result,
                error: task.error,
                job_name: extract_job_name(task)
              }]
            end
          end
          
          all_tasks = task_groups.values
        end
        
        render json: { tasks: all_tasks }
      end

      # GET /api/v1/ai_tasks/:id
      def show_ai_task
        ai_task = AiTask.find(params[:id])
        render json: { status: ai_task.status, result: ai_task.result, error: ai_task.error }
      end

      # Example dispatcher logic in create
      def create
        user_message = params[:message].to_s.strip
        conversation_id = params[:conversation_id]
        conversation = Conversation.find_by(id: conversation_id, user: current_user)
        
        # Token pre-check BEFORE any AI logic
        wallet = UserWallet.find_or_create_by(user: current_user)
        wallet.token_balance ||= 0
        min_token_cost = 10 # Set this to your minimum/typical cost per message
        if wallet.token_balance < min_token_cost
          render json: { error: "Insufficient tokens. Please purchase more to continue." }, status: :payment_required
          return
        end
        
        # Store user message
        ChatMessage.create!(
          user_id: current_user.id,
          conversation_id: conversation.id,
          user_message: user_message
        )
        
        # Let the AI decide how to handle the request
        # First, ask the AI if this request needs batch processing
        decision_prompt = "Analyze this user request and respond with ONLY 'batch' if it requires batch processing (like adding multiple questions to multiple sections, creating many sections, or bulk operations), or 'immediate' if it can be processed immediately: #{user_message}"
        
        begin
          decision_result = AiParserService.chat(decision_prompt)
          needs_batch = decision_result.to_s.downcase.include?('batch')
          
          # Also check for common batch patterns in the message itself
          batch_patterns = [
            /add\s+\d+\s+questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
            /add\s+\d+\s+(mcq|msq|theoretical)?\s*questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
            /create\s+\d+\s+questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
            /add\s+\d+\s+questions?\s+per\s+section/i,
            /\d+\s+questions?\s+(?:in|to|for)\s+(?:each|every)\s+section/i,
            /add\s+\d+\s+sections?\s+with\s+\d+\s+questions?/i,
            /create\s+\d+\s+sections?\s+with\s+\d+\s+questions?/i
          ]
          
          pattern_matches_batch = batch_patterns.any? { |pattern| user_message.match(pattern) }
          
          Rails.logger.info("AI decision for '#{user_message}': #{needs_batch ? 'batch' : 'immediate'}")
          Rails.logger.info("Pattern match for batch: #{pattern_matches_batch}")
          Rails.logger.info("Final decision: #{(needs_batch || pattern_matches_batch) ? 'batch' : 'immediate'}")
          
          if needs_batch || pattern_matches_batch
            # Use AI task for batch processing
            ai_task = AiTask.create!(
              conversation: conversation,
              user: current_user,
              status: :pending,
              request_payload: { message: user_message }.to_json
            )
            AiTaskJob.perform_later(ai_task.id)
            
            # Create initial response message
            initial_response = "Processing your request: #{user_message}"
            ChatMessage.create!(
              user_id: current_user.id,
              conversation_id: conversation.id,
              bot_reply: initial_response,
              ai_task_ids: [ai_task.id]
            )
            
            # Deduct tokens for batch processing (higher cost)
            batch_token_cost = 20
            if wallet.token_balance < batch_token_cost
              render json: { error: "Insufficient tokens for batch processing. Please purchase more to continue." }, status: :payment_required
              return
            end
            
            ActiveRecord::Base.transaction do
              wallet.token_balance -= batch_token_cost
              wallet.save!
              
              TokenTransaction.create!(
                user: current_user,
                conversation: conversation,
                amount: -batch_token_cost,
                source: 'ai_conversation_batch',
                meta: { message: user_message, ai_task_id: ai_task.id }
              )
            end
            
            render json: { status: 'processing', ai_task_id: ai_task.id }
          else
            # Process immediately
            result = AiParserService.chat(user_message)
            
            # Calculate token cost
            token_count = if result.is_a?(Hash)
              result[:token_count] || estimate_tokens(result[:message] || result[:reply] || result.to_s)
            else
              estimate_tokens(result.to_s)
            end
            
            # Check if user has enough tokens
            if wallet.token_balance < token_count
              render json: { error: "Insufficient tokens. Please purchase more to continue." }, status: :payment_required
              return
            end
            
            # Store AI response
            ai_text = if result.is_a?(Hash)
              result[:message] || result[:reply] || JSON.stringify(result)
            else
              result.to_s
            end
            
            # Deduct tokens and create transaction
            ActiveRecord::Base.transaction do
              wallet.token_balance -= token_count
              wallet.save!
              
              TokenTransaction.create!(
                user: current_user,
                conversation: conversation,
                amount: -token_count,
                source: 'ai_conversation',
                meta: { message: user_message }
              )
              
              ChatMessage.create!(
                user_id: current_user.id,
                conversation_id: conversation.id,
                bot_reply: ai_text,
                ai_task_ids: [] # or [ai_task.id] if available
              )
            end
            
            # Update test state if there's a test_update in the result
            if result.is_a?(Hash) && result[:test_update]
              test_state = ConversationTestState.find_or_create_by(
                conversation: conversation,
                user: current_user
              )
              
              # Update test state with the new structure
              if result[:test_update]['sections']
                result[:test_update]['sections'].each do |section|
                  if section['questions'].present?
                    Rails.logger.info("[AI_CONVERSATION_CONTROLLER] Updating section: #{section['name']}")
                    test_state.update_section(section['name'], section['questions'], section['duration'])
                  else
                    Rails.logger.warn("[AI_CONVERSATION_CONTROLLER] Skipping update for section #{section['name']} (no questions)")
                  end
                end
              end
              test_info = result[:test_update].except('sections')
              if test_info.any?
                Rails.logger.info("[AI_CONVERSATION_CONTROLLER] Updating test info: #{test_info.inspect}")
                test_state.update_test_info(test_info)
              else
                Rails.logger.warn("[AI_CONVERSATION_CONTROLLER] Skipping test info update (blank)")
              end
            end
            
            render json: { status: 'done', result: result }
          end
        rescue => e
          Rails.logger.error("Error in AI decision making: #{e.message}")
          # Fallback to immediate processing
          result = AiParserService.chat(user_message)
          
          # Calculate token cost for fallback
          token_count = if result.is_a?(Hash)
            result[:token_count] || estimate_tokens(result[:message] || result[:reply] || result.to_s)
          else
            estimate_tokens(result.to_s)
          end
          
          # Check if user has enough tokens
          if wallet.token_balance < token_count
            render json: { error: "Insufficient tokens. Please purchase more to continue." }, status: :payment_required
            return
          end
          
          ai_text = if result.is_a?(Hash)
            result[:message] || result[:reply] || JSON.stringify(result)
          else
            result.to_s
          end
          
          # Deduct tokens and create transaction for fallback
          ActiveRecord::Base.transaction do
            wallet.token_balance -= token_count
            wallet.save!
            
            TokenTransaction.create!(
              user: current_user,
              conversation: conversation,
              amount: -token_count,
              source: 'ai_conversation_fallback',
              meta: { message: user_message }
            )
            
            ChatMessage.create!(
              user_id: current_user.id,
              conversation_id: conversation.id,
              bot_reply: ai_text,
              ai_task_ids: [] # or [ai_task.id] if available
            )
          end
          
          # Update test state if there's a test_update in the result
          if result.is_a?(Hash) && result[:test_update]
            test_state = ConversationTestState.find_or_create_by(
              conversation: conversation,
              user: current_user
            )
            
            # Update test state with the new structure
            if result[:test_update]['sections']
              result[:test_update]['sections'].each do |section|
                if section['questions'].present?
                  Rails.logger.info("[AI_CONVERSATION_CONTROLLER] Updating section: #{section['name']}")
                  test_state.update_section(section['name'], section['questions'], section['duration'])
                else
                  Rails.logger.warn("[AI_CONVERSATION_CONTROLLER] Skipping update for section #{section['name']} (no questions)")
                end
              end
            end
            test_info = result[:test_update].except('sections')
            if test_info.any?
              Rails.logger.info("[AI_CONVERSATION_CONTROLLER] Updating test info: #{test_info.inspect}")
              test_state.update_test_info(test_info)
            else
              Rails.logger.warn("[AI_CONVERSATION_CONTROLLER] Skipping test info update (blank)")
            end
          end
          
          render json: { status: 'done', result: result }
        end
      end

      def reset
        # Create a new conversation for the user
        conversation = Conversation.create!(user: current_user, conversation_type: 'test_generate')
        # Create a new test state for this conversation
        ConversationTestState.create!(
          conversation: conversation,
          user: current_user
        )
        render json: { success: true, conversation_id: conversation.id }
      end

      def find_or_create
        # Always create a new conversation for the AI conversation page
        conversation = Conversation.create!(user: current_user, test_title: "AI Conversation #{Time.current.strftime('%Y-%m-%d %H:%M')}", conversation_type: 'test_generate')
        
        # Create test state for this conversation
        test_state = ConversationTestState.create!(
          conversation: conversation,
          user: current_user
        )

        # Create a default welcome message
        ChatMessage.create!(
          user_id: current_user.id,
          conversation_id: conversation.id,
          bot_reply: "Hi! I'm your AI Test Assistant. You can create a test by chatting with me or upload a document to autofill questions."
        )

        # Get conversation messages
        messages = conversation.chat_messages.order(:created_at).map do |msg|
          {
            sender: msg.user_message.present? ? 'user' : 'ai',
            text: msg.user_message.present? ? msg.user_message : msg.bot_reply,
            timestamp: msg.created_at.iso8601,
            ai_task_ids: msg.ai_task_ids || []
          }
        end

        render json: {
          conversation_id: conversation.id,
          messages: messages,
          test_update: test_state.test_state
        }
      end

      # Handle file upload for AI conversation
      def upload_file
        unless params[:file].present?
          render json: { error: 'No file provided' }, status: :bad_request
          return
        end

        # Token pre-check for file processing
        wallet = UserWallet.find_or_create_by(user: current_user)
        wallet.token_balance ||= 0
        file_token_cost = 15 # Higher cost for file processing
        if wallet.token_balance < file_token_cost
          render json: { error: "Insufficient tokens for file processing. Please purchase more to continue." }, status: :payment_required
          return
        end

        file = params[:file]
        file_type = file.content_type

        begin
          result = case file_type
          when /^image\//
            process_image_file(file)
          when /^audio\//
            process_audio_file(file)
          when /^application\/pdf$/
            process_document_file(file)
          when /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/
            process_document_file(file)
          when /^text\//
            process_document_file(file)
          when /^application\/json$/
            process_json_file(file)
          else
            { success: false, error: 'Unsupported file type' }
          end

          if result[:success]
            # Deduct tokens for successful file processing
            ActiveRecord::Base.transaction do
              wallet.token_balance -= file_token_cost
              wallet.save!
              
              TokenTransaction.create!(
                user: current_user,
                amount: -file_token_cost,
                source: 'file_upload',
                meta: { 
                  file_type: file_type,
                  file_name: file.original_filename,
                  message: result[:message] || 'File processed successfully'
                }
              )
            end
            
            render json: result
          else
            render json: result, status: :unprocessable_entity
          end

        rescue => e
          Rails.logger.error("Error processing file: #{e.message}")
          render json: { error: "Error processing file: #{e.message}" }, status: :internal_server_error
        end
      end

      def conversations
        if params[:deleted] == 'true'
          conversations = current_user.conversations.only_deleted.includes(:chat_messages).order(created_at: :desc)
        else
          conversations = current_user.conversations.includes(:chat_messages).order(created_at: :desc)
        end
        
        conversations_data = conversations.map do |conv|
          last_message = conv.chat_messages.last
          test_state = ConversationTestState.find_by(conversation: conv, user: current_user)
          {
            id: conv.id,
            testTitle: conv.test_title || "Untitled Test",
            lastMessage: last_message ? "#{last_message.user_message.present? ? 'You' : 'AI'}: #{last_message.user_message.present? ? last_message.user_message : last_message.bot_reply}" : "No messages yet",
            testData: test_state&.test_state || {},
            messages: conv.chat_messages.order(:created_at).map do |msg|
              {
                sender: msg.user_message.present? ? 'user' : 'ai',
                text: msg.user_message.present? ? msg.user_message : msg.bot_reply,
                timestamp: msg.created_at.iso8601,
                ai_task_ids: msg.ai_task_ids || []
              }
            end
          }
        end

        render json: { conversations: conversations_data }
      end

      def conversation_state
        conversation = Conversation.find_by(id: params[:conversation_id], user: current_user)
        test_state = ConversationTestState.find_by(conversation: conversation, user: current_user)
        
        Rails.logger.info("Conversation state request for conversation #{params[:conversation_id]}")
        Rails.logger.info("Test state found: #{!test_state.nil?}")
        Rails.logger.info("Test state data: #{test_state&.test_state&.inspect}")
        Rails.logger.info("Sections in test state: #{test_state&.test_state&.dig('sections')&.inspect}")
        
        messages = []
        conversation&.chat_messages&.order(:created_at)&.each do |msg|
          if msg.user_message.present?
            messages << {
              sender: 'user',
              text: msg.user_message,
              timestamp: msg.created_at.iso8601,
              ai_task_ids: msg.ai_task_ids || []
            }
          end
          if msg.bot_reply.present?
            messages << {
              sender: 'ai',
              text: msg.bot_reply,
              timestamp: msg.created_at.iso8601,
              ai_task_ids: msg.ai_task_ids || []
            }
          end
        end
        
        Rails.logger.info("Conversation state for #{params[:conversation_id]}: #{messages.count} messages")
        Rails.logger.info("Messages: #{messages.inspect}")
        
        render json: { 
          test_update: test_state&.test_state,
          messages: messages
        }
      end

      # Bulk soft delete all conversations for the current user
      def soft_delete_all
        conversations = current_user.conversations # Paranoia already scopes to non-deleted
        updated_count = conversations.destroy_all.size
        render json: { success: true, count: updated_count }
      end

      # Soft delete a single conversation
      def soft_delete
        conversation = current_user.conversations.find_by(id: params[:id])
        if conversation
          conversation.destroy
          render json: { success: true }
        else
          render json: { error: 'Conversation not found' }, status: :not_found
        end
      end

      # Restore a single conversation
      def restore
        conversation = current_user.conversations.only_deleted.find_by(id: params[:id])
        if conversation
          conversation.restore_with_associations!
          render json: { success: true }
        else
          render json: { error: 'Conversation not found' }, status: :not_found
        end
      end

      # Restore all deleted conversations for the current user
      def restore_all
        conversations = current_user.conversations.only_deleted
        updated_count = conversations.each(&:restore_with_associations!).size
        render json: { success: true, count: updated_count }
      end

      # Permanently delete a single conversation
      def permanent_delete
        conversation = current_user.conversations.only_deleted.find_by(id: params[:id])
        if conversation
          conversation.really_destroy!
          render json: { success: true }
        else
          render json: { error: 'Conversation not found or not in Trash' }, status: :not_found
        end
      end

      # Permanently delete all trashed conversations for the current user
      def permanent_delete_all
        conversations = current_user.conversations.only_deleted
        deleted_count = conversations.size
        conversations.each(&:really_destroy!)
        render json: { success: true, count: deleted_count }
      end

      # Save conversation test data as a draft test
      def save_draft
        Rails.logger.info("Save draft called with params: #{params.inspect}")
        Rails.logger.info("Looking for conversation with ID: #{params[:id]}")
        Rails.logger.info("Current user ID: #{current_user.id}")
        
        # Check all conversations for this user
        all_conversations = current_user.conversations.pluck(:id)
        Rails.logger.info("All conversations for user: #{all_conversations}")
        
        conversation = current_user.conversations.find_by(id: params[:id])
        Rails.logger.info("Found conversation: #{conversation&.inspect}")
        
        unless conversation
          render json: { error: 'Conversation not found' }, status: :not_found
          return
        end

        test_state = ConversationTestState.find_by(conversation: conversation, user: current_user)
        Rails.logger.info("Found test state: #{test_state&.inspect}")
        Rails.logger.info("Test state data: #{test_state&.test_state&.inspect}")
        
        unless test_state&.test_state
          render json: { error: 'No test data available to save' }, status: :unprocessable_entity
          return
        end

        begin
          # Create a new test from the conversation data
          test_data = test_state.test_state
          
          # Create the test
          test = current_user.tests.build(
            title: test_data['title'] || conversation.test_title || "Test from AI Conversation",
            description: test_data['description'] || "Test created from AI conversation",
            test_type: test_data['test_type'] || 'MCQ',
            duration: test_data['duration'] || 30,
            status: 'draft'
          )

          if test.save
            # Create sections and questions
            if test_data['sections']&.any?
              test_data['sections'].each do |section_data|
                section = test.sections.create!(
                  name: section_data['name'] || 'Section',
                  duration: section_data['duration'] || 30
                )

                if section_data['questions']&.any?
                  section_data['questions'].each do |question_data|
                    Rails.logger.info("Processing question data: #{question_data.inspect}")
                    
                    # Handle both old format (option_1, option_2, etc.) and new format (options array)
                    options = question_data['options'] || []
                    option_1 = question_data['option_1'] || options[0] || ''
                    option_2 = question_data['option_2'] || options[1] || ''
                    option_3 = question_data['option_3'] || options[2] || ''
                    option_4 = question_data['option_4'] || options[3] || ''
                    
                    Rails.logger.info("Extracted options - option_1: '#{option_1}', option_2: '#{option_2}', option_3: '#{option_3}', option_4: '#{option_4}'")
                    
                    section.questions.create!(
                      content: question_data['content'] || '',
                      question_type: question_data['question_type'] || 'MCQ',
                      option_1: option_1,
                      option_2: option_2,
                      option_3: option_3,
                      option_4: option_4,
                      correct_answer: question_data['correct_answer'] || '',
                      marks: question_data['marks'] || 1
                    )
                  end
                end
              end
            end

            # Create notification
            Notification.create!(
              user: current_user,
              message: "Your test '#{test.title}' was saved as draft from AI conversation.",
              notifiable: test
            )

            render json: { 
              success: true, 
              message: "Test saved as draft successfully!",
              test_id: test.id,
              test_slug: test.slug,
              test_title: test.title
            }
          else
            render json: { error: test.errors.full_messages.join(', ') }, status: :unprocessable_entity
          end
        rescue => e
          Rails.logger.error("Error saving draft from conversation: #{e.class} - #{e.message}")
          Rails.logger.error e.backtrace.join("\n")
          render json: { error: "Failed to save draft: #{e.message}" }, status: :internal_server_error
        end
      end

      # Update conversation title
      def update
        conversation = Conversation.find_by(id: params[:id], user: current_user)
        unless conversation
          render json: { error: "Conversation not found" }, status: :not_found
          return
        end

        if conversation.update(test_title: params[:test_title])
          render json: { 
            success: true, 
            message: "Conversation title updated successfully",
            conversation: {
              id: conversation.id,
              test_title: conversation.test_title,
              updated_at: conversation.updated_at
            }
          }
        else
          render json: { 
            error: "Failed to update conversation title",
            errors: conversation.errors.full_messages 
          }, status: :unprocessable_entity
        end
      end

      private
      
      def extract_job_name(task)
        job_name = "Job #{task.id}"
        begin
          payload = JSON.parse(task.request_payload) rescue {}
          job_name = payload['job_name'] || payload['message']&.truncate(30) || "Job #{task.id}"
        rescue
          # Keep default name if parsing fails
        end
        job_name
      end

      def process_document_file(file)
        # Extract text from the uploaded file
        text = ExtractorService.extract_text(file)
        
        if text.nil? || text.strip.empty?
          return { success: false, error: 'Failed to extract text from file' }
        end

        # Use AI service to generate test structure
        test_update = AiParserService.generate_test_from_description(text)
        
        if test_update
          return {
            success: true,
            message: "File processed successfully. Here are the generated questions.",
            reply: "I've processed your document and generated test questions based on the content.",
            test_update: test_update
          }
        else
          return {
            success: false,
            error: "AI service is currently unavailable. Please try again in a few minutes."
          }
        end
      end

      def process_audio_file(file)
        # For now, return a placeholder response
        # In a real implementation, you would use a speech-to-text service
        return {
          success: true,
          message: "Voice message received. I'm processing your audio.",
          reply: "I've received your voice message. Please note that voice transcription is currently being implemented. For now, you can type your message or upload a document.",
          test_update: nil
        }
      end

      # Simple token estimation fallback if not provided by AI
      def estimate_tokens(text)
        (text.to_s.length / 4.0).ceil # Roughly 4 chars per token
      end
    end
  end
end 
require 'httparty'
require 'net/http'
require 'digest'

module Api
  module V1
    class AiChatController < ApplicationController
      before_action :authenticate_user!

      def create
        user_message = params[:message].to_s.strip
        conversation_id = params[:conversation_id]
        restart_commands = ["restart", "start over", "clear test"]

        # 1. Find conversation and ensure ownership
        conversation = Conversation.find_by(id: conversation_id, user: current_user)
        unless conversation
          render json: { error: "Invalid or missing conversation_id" }, status: :unprocessable_entity
          return
        end

        # Get or create test state for this conversation
        test_state = ConversationTestState.find_or_create_by(
          conversation: conversation,
          user: current_user
        )

        # Token pre-check BEFORE any AI logic
        wallet = UserWallet.find_or_create_by(user: current_user)
        wallet.token_balance ||= 0
        min_token_cost = 10 # Set this to your minimum/typical cost per message
        if wallet.token_balance < min_token_cost
          render json: { error: "Insufficient tokens. Please purchase more to continue." }, status: :payment_required
          return
        end

        # 2. Handle restart/clear commands
        if restart_commands.include?(user_message.downcase)
          test_state.clear_state
          ChatMessage.create!(
            user_id: current_user.id,
            conversation_id: conversation.id,
            user_message: user_message,
            bot_reply: "Okay, I've cleared the current test. Would you like to start creating a new one?"
          )
          render json: {
            reply: "Okay, I've cleared the current test. Would you like to start creating a new one?",
            test_update: nil
          }
          return
        end

        # 3. AI call (direct or chat) with Redis caching
        test_state_digest = Digest::SHA256.hexdigest(test_state.test_state.to_json)
        redis_cache_key = "ai_chat_reply_#{current_user.id}_#{conversation.id}_#{test_state_digest}_#{Digest::SHA256.hexdigest(user_message)}"
        ai_result_json = Sidekiq.redis { |conn| conn.get(redis_cache_key) }
        if ai_result_json
          ai_result = JSON.parse(ai_result_json, symbolize_names: true)
          token_count = ai_result[:token_count] || min_token_cost
          Rails.logger.info("Using cached AI result for key: #{redis_cache_key}")
        else
          ai_result = nil
          token_count = min_token_cost
          if user_message =~ /create a test for|generate a test for|make a test for|build a test for/i
            test_update = AiParserService.generate_test_from_description(user_message)
            bot_reply = test_update ? "✅ Your test has been generated and pre-filled. Please review and publish." : "Sorry, the test could not be generated."
            test_state.update_test_info(test_update) if test_update
            ai_result = { reply: bot_reply, test_update: test_update }
            token_count = estimate_tokens(bot_reply)
            Rails.logger.info("Generated test from description: #{bot_reply}")
          else
            chat_history = conversation.chat_messages.order(:created_at).last(10).map { |msg| { user: msg.user_message, bot: msg.bot_reply } }
            result = AiParserService.chat(user_message, conversation: chat_history, latest_test_update: test_state.test_state)
            ai_result = { reply: result[:reply], test_update: result[:test_update] }
            token_count = result[:token_count] || estimate_tokens(result[:reply])
            Rails.logger.info("AI chat result: reply length=#{result[:reply]&.length}, test_update present=#{!result[:test_update].nil?}")
            # Update test state if there's a new update
            if result[:test_update]
              if result[:test_update]['sections']
                result[:test_update]['sections'].each do |section|
                  # Defensive: Only update if questions are present
                  if section['questions'].present?
                    Rails.logger.info("[AI_CHAT_CONTROLLER] Updating section: #{section['name']}")
                    test_state.update_section(section['name'], section['questions'], section['duration'])
                  else
                    Rails.logger.warn("[AI_CHAT_CONTROLLER] Skipping update for section #{section['name']} (no questions)")
                  end
                end
              end
              test_info = result[:test_update].except('sections')
              if test_info.any?
                # Defensive: Only update if test_info is not blank
                Rails.logger.info("[AI_CHAT_CONTROLLER] Updating test info: #{test_info.inspect}")
                test_state.update_test_info(test_info)
              else
                Rails.logger.warn("[AI_CHAT_CONTROLLER] Skipping test info update (blank)")
              end
            end
          end
          # Store in Redis cache
          Sidekiq.redis { |conn| conn.set(redis_cache_key, ai_result.to_json, ex: 6*60*60) }
          Rails.logger.info("Stored AI result in cache with key: #{redis_cache_key}")
        end

        # --- PATCH: Parse AI reply for test_update if present ---
        reply_message = ai_result[:reply]
        test_update = ai_result[:test_update] || test_state.test_state
        
        # Improved parsing logic with better error handling
        begin
          # First, try to parse the AI reply as JSON
          if ai_result[:reply] && ai_result[:reply].strip.start_with?('{')
            parsed = JSON.parse(ai_result[:reply])
            if parsed.is_a?(Hash) && parsed['test_update']
              test_update = parsed['test_update']
              reply_message = parsed['message'] || "Test updated successfully."
              Rails.logger.info("Successfully parsed AI reply as JSON with test_update")
            else
              # JSON but no test_update - use current structure
              reply_message = parsed['message'] || "Test updated successfully."
              test_update = test_state.test_state
              Rails.logger.info("Parsed JSON but no test_update found, using current structure")
            end
          elsif ai_result[:reply] && ai_result[:reply].include?('{')
            # Try to extract JSON from mixed content
            json_match = ai_result[:reply].match(/\{.*\}/m)
            if json_match
              begin
                parsed = JSON.parse(json_match[0])
                if parsed.is_a?(Hash) && parsed['test_update']
                  test_update = parsed['test_update']
                  reply_message = parsed['message'] || "Test updated successfully."
                  Rails.logger.info("Successfully extracted and parsed JSON from mixed content")
                else
                  reply_message = parsed['message'] || "Test updated successfully."
                  test_update = test_state.test_state
                  Rails.logger.info("Extracted JSON but no test_update, using current structure")
                end
              rescue JSON::ParserError => e
                Rails.logger.error("Failed to parse extracted JSON: #{e.message}")
                # Check if it's truncated
                looks_truncated = (
                  json_match[0].length > 500 ||
                  json_match[0].strip.end_with?(',', '[', '{') ||
                  (json_match[0].include?('"questions": [') && !json_match[0].include?(']') && !json_match[0].include?('}')) ||
                  json_match[0].include?('"question_type":') && !json_match[0].include?('}') ||
                  json_match[0].strip.end_with?('"')
                )
                
                if looks_truncated
                  reply_message = "The response was incomplete. Please try your request again with fewer questions or a simpler modification."
                  test_update = test_state.test_state
                  Rails.logger.warn("Detected truncated JSON in controller")
                else
                  reply_message = ai_result[:reply]
                  test_update = test_state.test_state
                  Rails.logger.info("No valid JSON found in AI reply, using as-is")
                end
              end
            else
              # No valid JSON found, use the reply as-is
              reply_message = ai_result[:reply]
              test_update = test_state.test_state
              Rails.logger.info("No valid JSON found in AI reply, using as-is")
            end
          else
            # Not JSON, use the reply as-is
            reply_message = ai_result[:reply] || "Test updated successfully."
            test_update = test_state.test_state
            Rails.logger.info("AI reply is not JSON, using as-is")
          end
        rescue JSON::ParserError => e
          Rails.logger.error("JSON parsing failed: #{e.message}")
          Rails.logger.error("Failed content: #{ai_result[:reply]}")
          # Fallback: use the AI reply as-is and current test structure
          reply_message = ai_result[:reply] || "Could not update test as requested. Returning current structure."
          test_update = test_state.test_state
        rescue => e
          Rails.logger.error("Unexpected error parsing AI reply: #{e.class} - #{e.message}")
          # Fallback: use the AI reply as-is and current test structure
          reply_message = ai_result[:reply] || "Could not update test as requested. Returning current structure."
          test_update = test_state.test_state
        end
        
        # Ensure we always have a valid reply message
        reply_message ||= "Test updated successfully."
        test_update ||= test_state.test_state
        # --- END PATCH ---

        # 4. Token deduction and transaction
        if wallet.token_balance < token_count
          render json: { error: "Insufficient tokens. Please purchase more to continue." }, status: :payment_required
          return
        end

        ActiveRecord::Base.transaction do
          wallet.token_balance -= token_count
          wallet.save!

          begin
            TokenTransaction.create!(
              user: current_user,
              conversation: conversation,
              amount: -token_count,
              source: 'chat',
              meta: { message: user_message }
            )
          rescue => e
            Rails.logger.error "TokenTransaction creation failed: #{e.class} - #{e.message}"
            Rails.logger.error e.backtrace.join("\n")
          end

          ChatMessage.create!(
            user_id: current_user.id,
            conversation_id: conversation.id,
            user_message: user_message,
            bot_reply: reply_message
          )
        end

        # Log the final response being sent
        Rails.logger.info("Final API response: reply length=#{reply_message&.length}, test_update present=#{!test_update.nil?}, token_count=#{token_count}")
        
        render json: {
          reply: reply_message,
          test_update: test_update,
          token_count: token_count,
          wallet_balance: wallet.token_balance
        }
      end

      def reset
        # Create a new conversation for the user
        conversation = Conversation.create!(user: current_user)
        # Create a new test state for this conversation
        ConversationTestState.create!(
          conversation: conversation,
          user: current_user
        )
        render json: { success: true, conversation_id: conversation.id }
      end

      def find_or_create
        # Find existing conversation or create new one
        conversation = Conversation.find_or_create_by(user: current_user) do |conv|
          conv.test_title = "New Test #{Time.current.strftime('%Y-%m-%d %H:%M')}"
        end
        
        # Ensure test state exists
        test_state = ConversationTestState.find_or_create_by(
          conversation: conversation,
          user: current_user
        )

        render json: {
          id: conversation.id,
          testTitle: conversation.test_title,
          lastMessage: conversation.chat_messages.last&.bot_reply || "Start a new conversation",
          testData: test_state.test_state
        }
      end

      def conversations
        conversations = current_user.conversations.includes(:chat_messages).order(created_at: :desc)
        
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
                timestamp: msg.created_at.iso8601
              }
            end
          }
        end

        render json: { conversations: conversations_data }
      end

      def conversation_state
        conversation = Conversation.find_by(id: params[:conversation_id], user: current_user)
        test_state = ConversationTestState.find_by(conversation: conversation, user: current_user)
        render json: { test_update: test_state&.test_state }
      end

      def upload_json_file
        unless params[:file].present?
          render json: { error: "No file provided" }, status: :bad_request
          return
        end

        file = params[:file]
        user_message = params[:message] || "Please process this JSON file"

        # Check file type
        unless file.content_type == 'application/json' || File.extname(file.original_filename).downcase == '.json'
          render json: { error: "Please upload a valid JSON file" }, status: :unprocessable_entity
          return
        end

        # Check file size (limit to 5MB)
        if file.size > 5.megabytes
          render json: { error: "File size too large. Please upload a file smaller than 5MB" }, status: :unprocessable_entity
          return
        end

        begin
          # Read file content
          file_content = file.read
          
          # Process the JSON file
          result = AiParserService.process_json_file(file_content, user_message)
          
          if result[:test_update]
            # Update the test state
            conversation = Conversation.find_by(id: params[:conversation_id], user: current_user)
            unless conversation
              render json: { error: "Invalid conversation_id" }, status: :unprocessable_entity
              return
            end

            test_state = ConversationTestState.find_or_create_by(
              conversation: conversation,
              user: current_user
            )

            # Update test state with the new structure
            if result[:test_update]['sections']
              result[:test_update]['sections'].each do |section|
                # Defensive: Only update if questions are present
                if section['questions'].present?
                  Rails.logger.info("[AI_CHAT_CONTROLLER] Updating section: #{section['name']}")
                  test_state.update_section(section['name'], section['questions'], section['duration'])
                else
                  Rails.logger.warn("[AI_CHAT_CONTROLLER] Skipping update for section #{section['name']} (no questions)")
                end
              end
            end
            test_info = result[:test_update].except('sections')
            if test_info.any?
              # Defensive: Only update if test_info is not blank
              Rails.logger.info("[AI_CHAT_CONTROLLER] Updating test info: #{test_info.inspect}")
              test_state.update_test_info(test_info)
            else
              Rails.logger.warn("[AI_CHAT_CONTROLLER] Skipping test info update (blank)")
            end

            # Create chat message
            ChatMessage.create!(
              user_id: current_user.id,
              conversation_id: conversation.id,
              user_message: "Uploaded JSON file: #{file.original_filename}",
              bot_reply: result[:reply]
            )

            render json: {
              reply: result[:reply],
              test_update: result[:test_update],
              message: "JSON file processed successfully"
            }
          else
            render json: {
              reply: result[:reply],
              test_update: nil,
              error: "Failed to process JSON file"
            }, status: :unprocessable_entity
          end

        rescue => e
          Rails.logger.error("Error processing JSON file: #{e.message}")
          render json: { error: "Error processing file: #{e.message}" }, status: :internal_server_error
        end
      end

      def export_test_json
        conversation = Conversation.find_by(id: params[:conversation_id], user: current_user)
        test_state = ConversationTestState.find_by(conversation: conversation, user: current_user)
        
        unless test_state
          render json: { error: "No test state found" }, status: :not_found
          return
        end

        json_content = AiParserService.export_test_to_json(test_state.test_state)
        
        send_data json_content, 
                  filename: "test_#{conversation.id}_#{Time.current.strftime('%Y%m%d_%H%M%S')}.json",
                  type: 'application/json'
      end

      # Bulk soft delete all conversations for the current user
      def soft_delete_all
        conversations = current_user.conversations.where(deleted: [false, nil])
        updated_count = conversations.update_all(deleted: true)
        render json: { success: true, count: updated_count }
      end

      private
      # Simple token estimation fallback if not provided by AI
      def estimate_tokens(text)
        (text.to_s.length / 4.0).ceil # Roughly 4 chars per token
      end
    end
  end
end
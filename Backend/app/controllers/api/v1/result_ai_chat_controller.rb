require 'httparty'
require 'net/http'
require 'digest'

module Api
  module V1
    class ResultAiChatController < ApplicationController
      before_action :authenticate_user!

      def create
        user_message = params[:message].to_s.strip
        test_id = params[:test_id]
        conversation_id = params[:conversation_id]

        test = Test.find_by(id: test_id, user: current_user)
        unless test
          render json: { error: "Test not found or access denied" }, status: :not_found
          return
        end

        conversation = Conversation.find_by(id: conversation_id, user: current_user)
        unless conversation
          conversation = Conversation.create!(user: current_user, test: test)
        end
        
        Rails.logger.info "Using conversation ID: #{conversation.id}, Test ID: #{conversation.test_id}"

        # Get context data from conversation
        context_data = nil
        if conversation.context_data.present?
          begin
            context_data = JSON.parse(conversation.context_data)
          rescue JSON::ParserError => e
            Rails.logger.error "Failed to parse context_data JSON: #{e.message}"
            context_data = nil
          end
        end
        
        Rails.logger.info "Context data for conversation #{conversation.id}: #{context_data.present? ? 'Present' : 'Missing'}"
        Rails.logger.info "Context data content: #{context_data.inspect}" if context_data.present?

        # Token check
        wallet = UserWallet.find_or_create_by(user: current_user)
        wallet.token_balance ||= 0
        min_token_cost = 15
        if wallet.token_balance < min_token_cost
          render json: { error: "Insufficient tokens. Please purchase more to continue." }, status: :payment_required
          return
        end

        # AI analysis
        context_digest = Digest::SHA256.hexdigest(context_data.to_json)
        ai_cache_key = "ai_reply_#{test.id}_#{conversation.id}_#{context_digest}_#{Digest::SHA256.hexdigest(user_message)}"
        ai_result = Rails.cache.fetch(ai_cache_key, expires_in: 6.hours) do
          analyze_results_with_ai(user_message, context_data, conversation)
        end
        ai_result[:reply] = postprocess_markdown_tables(ai_result[:reply]) if ai_result[:reply].present?
        token_count = ai_result[:token_count] || estimate_tokens(ai_result[:reply])

        if wallet.token_balance < token_count
          render json: { error: "Insufficient tokens. Please purchase more to continue." }, status: :payment_required
          return
        end

        # Save transaction and message
        ActiveRecord::Base.transaction do
          wallet.token_balance -= token_count
          wallet.save!

          TokenTransaction.create!(
            user: current_user,
            conversation: conversation,
            amount: -token_count,
            source: 'result_analysis',
            meta: { message: user_message, test_id: test_id }
          )

          ChatMessage.create!(
            user_id: current_user.id,
            conversation_id: conversation.id,
            user_message: user_message,
            bot_reply: ai_result[:reply]
          )
        end

        render json: {
          reply: ai_result[:reply],
          conversation_id: conversation.id,
          token_count: token_count,
          wallet_balance: wallet.token_balance
        }
      rescue => e
        Rails.logger.error "Result AI Chat Error: #{e.class} - #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: "An error occurred while analyzing results. Please try again." }, status: :internal_server_error
      end

      def reset
        test_id = params[:test_id]
        test = Test.find_by(id: test_id, user: current_user)
        
        unless test
          render json: { error: "Test not found or access denied" }, status: :not_found
          return
        end

        conversation = Conversation.create!(user: current_user, test: test, conversation_type: 'result_process')
        
        render json: { 
          success: true, 
          conversation_id: conversation.id,
          message: "New conversation started for result analysis"
        }
      end

      # POST /api/v1/result_ai_chat/sync
      def sync
        test_id = params[:test_id]
        conversation_id = params[:conversation_id]

        test = Test.find_by(id: test_id, user: current_user)
        unless test
          render json: { error: "Test not found or access denied" }, status: :not_found
          return
        end

        conversation = Conversation.find_by(id: conversation_id, user: current_user)
        unless conversation
          conversation = Conversation.create!(user: current_user, test: test, conversation_type: 'result_process')
        end

        # Gather all test data
        test_attempts = test.test_attempts.order(created_at: :desc)
        redis_key = "ai_context_data_test_#{test.id}"
        context_data_json = Sidekiq.redis { |conn| conn.get(redis_key) }
        if context_data_json
          context_data = JSON.parse(context_data_json)
        else
          context_data = prepare_result_context(test, test_attempts)
          Sidekiq.redis { |conn| conn.set(redis_key, context_data.to_json, ex: 12*60*60) }
        end
        
        Rails.logger.info "Prepared context data for test #{test_id}: #{context_data.inspect}"

        # Store context data in conversation (we'll use a text column to store JSON)
        conversation.update!(context_data: context_data.to_json)
        
        Rails.logger.info "Stored context data in conversation #{conversation.id}"
        
        render json: { success: true, conversation_id: conversation.id, message: "Results synced! You can now chat with the AI about the latest data." }
      rescue => e
        Rails.logger.error "Result AI Chat Sync Error: #{e.class} - #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: "An error occurred while syncing results. Please try again." }, status: :internal_server_error
      end

      # POST /api/v1/result_ai_chat/find_or_create
      def find_or_create
        test_id = params[:test_id]
        test = Test.find_by(id: test_id, user: current_user)
        unless test
          render json: { error: "Test not found or access denied" }, status: :not_found
          return
        end

        conversation = Conversation.find_by(user: current_user, test: test)
        unless conversation
          conversation = Conversation.create!(user: current_user, test: test, conversation_type: 'result_process')
        end

        render json: { conversation_id: conversation.id }
      end

      private

      def prepare_result_context(test, test_attempts)
        # Calculate additional statistics
        scores = test_attempts.where.not(marks: nil).pluck(:marks)
        score_distribution = scores.group_by { |score| (score / 10) * 10 }.transform_values(&:count)
        
        {
          test_info: {
            title: test.title,
            description: test.description,
            test_type: test.test_type,
            duration: test.duration,
            total_questions: test.questions.count
          },
          attempts_summary: {
            total_attempts: test_attempts.count,
            completed_attempts: test_attempts.where.not(completed_at: nil).count,
            average_score: test_attempts.where.not(marks: nil).average(:marks)&.round(2),
            highest_score: test_attempts.maximum(:marks),
            lowest_score: test_attempts.minimum(:marks),
            median_score: calculate_median(scores),
            score_distribution: score_distribution,
            all_attempts: test_attempts.map do |attempt|
              {
                name: attempt.name,
                email: attempt.email,
                marks: attempt.marks,
                completed_at: attempt.completed_at,
                duration_taken: attempt.completed_at && attempt.started_at ? 
                  ((attempt.completed_at - attempt.started_at) / 60).round(2) : nil
              }
            end
          }
        }
      end

      def analyze_results_with_ai(user_message, context_data, conversation)
        uri = URI.parse("https://api.aimlapi.com/v1/chat/completions")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true

        chat_history = conversation.chat_messages.order(:created_at).last(10).map do |msg| 
          { role: msg.user_message.present? ? "user" : "assistant", content: msg.user_message || msg.bot_reply }
        end

        request = Net::HTTP::Post.new(uri.request_uri, {
          "Authorization" => "Bearer #{ENV['AIMLAPI_KEY']}",
          "Content-Type" => "application/json"
        })

        # Prepare the system message with context
        system_message = "You are an AI Result Analyst specializing in test performance analysis. You help teachers and HR professionals understand test results, identify patterns, and provide actionable insights."
        
        if context_data
          attempts_summary = context_data['attempts_summary'] || {}
          total_attempts = attempts_summary['total_attempts'] || 0
          system_message += "\n\nIMPORTANT: You have access to the complete test data for analysis. Use this data to answer questions about candidates, performance, and test results:\n\n#{JSON.pretty_generate(context_data)}\n\n"
          system_message += "When the user asks for a table or CSV, output ONLY a valid JSON array of objects (no extra text). Example:\n````json\n[\n  { \"name\": \"Test User 1\", \"email\": \"user1@example.com\", \"marks\": 50 },\n  { \"name\": \"Test User 2\", \"email\": \"user2@example.com\", \"marks\": 48 }\n]\n````\n\n"
          system_message += "When the user asks for a chart (bar, line, pie, doughnut, radar, polar, etc.), you MUST output ONLY a valid JSON object with a 'type' field (e.g., 'type': 'line', 'type': 'bar', etc.) and a 'data' field that is compatible with Chart.js. Do NOT use the legacy format.\n\nExample for a line chart:\n````json\n{\n  \"type\": \"line\",\n  \"data\": {\n    \"labels\": [\"0\", \"10\", \"20\", \"30\", \"40\", \"50\"],\n    \"datasets\": [\n      {\n        \"label\": \"Number of Students\",\n        \"data\": [13, 6, 13, 11, 8, 4],\n        \"borderColor\": \"rgba(54, 162, 235, 1)\",\n        \"backgroundColor\": \"rgba(54, 162, 235, 0.2)\",\n        \"tension\": 0.4\n      }\n    ]\n  }\n}\n````\n\nDo not include any extra text or explanation, just the JSON.\n\n"
          system_message += "When asked about candidates, use the 'all_attempts' data to identify top performers based on marks, completion time, and other relevant metrics. You can analyze all #{total_attempts} attempts to provide comprehensive insights. Always reference the actual data provided above and provide specific examples from the candidate list."
        else
          system_message += "\n\nNote: No test data has been synced yet. Please sync the test results first to provide meaningful analysis."
        end

        body = {
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: system_message },
            *chat_history,
            { role: "user", content: user_message }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }
        request.body = body.to_json
        
        Rails.logger.info "Sending to AI API: #{body.inspect}"

        response = http.request(request)
        unless response.is_a?(Net::HTTPSuccess)
          return { reply: "Sorry, I'm having trouble analyzing the results right now. Please try again later.", token_count: 50 }
        end

        data = JSON.parse(response.body)
        content = data.dig("choices", 0, "message", "content")
        if content.nil? || content.strip.empty?
          return { reply: "Sorry, I couldn't generate a response. Please try again.", token_count: 50 }
        end

        token_count = estimate_tokens(content) + estimate_tokens(user_message)
        { reply: content, token_count: token_count }
      end

      def estimate_tokens(text)
        (text.to_s.length / 4.0).ceil
      end

      def calculate_median(array)
        return nil if array.empty?
        sorted = array.sort
        len = sorted.length
        if len.odd?
          sorted[len / 2]
        else
          (sorted[len / 2 - 1] + sorted[len / 2]) / 2.0
        end
      end

      def postprocess_markdown_tables(text)
        # Extract and reformat all Markdown-like tables in the text
        lines = text.split("\n")
        output = []
        table_buffer = []
        in_table = false
        lines.each_with_index do |line, idx|
          # A table row must have at least two pipes and start/end with a pipe
          is_table_row = line.strip.match(/^\|.*\|$/) && line.strip.count('|') >= 2
          if is_table_row
            in_table = true
            # Remove line breaks inside cells (join with previous if not a new row)
            if table_buffer.any? && !table_buffer.last.strip.end_with?('|')
              table_buffer[-1] += ' ' + line.strip
            else
              table_buffer << line.strip.gsub(/\s+\|\s+/, ' | ')
            end
          else
            if in_table && table_buffer.any?
              output << build_markdown_table(table_buffer)
              table_buffer = []
              in_table = false
            end
            output << line
          end
        end
        # If table at end
        output << build_markdown_table(table_buffer) if in_table && table_buffer.any?
        output.join("\n")
      end

      def build_markdown_table(table_lines)
        return table_lines.join("\n") if table_lines.empty?
        rows = []
        buffer = []
        table_lines.each do |line|
          if line.count('|') >= 2 && line.strip.start_with?('|') && line.strip.end_with?('|')
            rows << buffer.join(' ').strip unless buffer.empty?
            buffer = [line.strip]
          else
            buffer << line.strip
          end
        end
        rows << buffer.join(' ').strip unless buffer.empty?
        header_cells = rows[0].split('|').map(&:strip).reject(&:empty?)
        cols = header_cells.size
        cleaned = rows.map do |row|
          cells = row.split('|').map(&:strip).reject.with_index { |_, i| i == 0 || i == row.split('|').size - 1 }
          # Fallback: If only one cell, try to split by spaces as a last resort
          if cells.size == 1 && cols > 1
            alt = cells[0].split(/\s+/).map(&:strip).reject(&:empty?)
            cells = alt if alt.size == cols
          end
          cells = cells[0...cols] + Array.new([0, cols - cells.size].max, '')
          '| ' + cells.join(' | ') + ' |'
        end
        if cleaned.size == 1 || !cleaned[1].match(/^\|[ -|]+\|$/)
          cleaned.insert(1, '|' + Array.new(cols, '---').join('|') + '|')
        end
        cleaned.join("\n")
      end
    end
  end
end 
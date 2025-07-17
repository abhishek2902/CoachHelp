# app/controllers/api/v1/tests_process_controller.rb
module Api
  module V1
    class TestsProcessController < ApplicationController
      before_action :authenticate_user!
      
      def upload_file
        unless params[:file].present?
          return render json: { error: 'No file provided' }, status: :bad_request
        end

        begin
          Rails.logger.info("Processing uploaded file: #{params[:file].original_filename}")

          # Extract text from the uploaded file (supporting PDF, DOCX, TXT)
          file = params[:file]
          text = ExtractorService.extract_text(file)

          # Use the same AI service as chat to generate the test structure
          test_update = AiParserService.generate_test_from_description(text)
          
          # Check if AI service failed
          unless test_update
            render json: { 
              error: "AI service is currently unavailable. Please try again in a few minutes or contact support if the issue persists." 
            }, status: :service_unavailable
            return
          end

          # Flatten structure if needed (move all keys to top level)
          if test_update.is_a?(Hash) && (test_update.key?('test') || test_update.key?(:test))
            test_hash = test_update['test'] || test_update[:test]
            sections = test_update['sections'] || test_update[:sections] || []
            test_update = test_hash.merge('sections' => sections)
          end

          # Use the conversation_id from the request, or find/create one if not provided
          conversation_id = params[:conversation_id]
          if conversation_id
            conversation = Conversation.find_by(id: conversation_id, user: current_user)
            unless conversation
              render json: { error: "Invalid conversation_id" }, status: :unprocessable_entity
              return
            end
          else
            # Fallback: use the existing conversation from the chat, or create one if none exists
            conversation = Conversation.where(user: current_user).order(:created_at).last
            unless conversation
              conversation = Conversation.create!(user: current_user)
            end
          end
          
          # Update the user's conversation test state so future chat builds on this
          test_state = ConversationTestState.find_or_create_by(conversation: conversation, user: current_user)
          
          # Merge with existing test state instead of replacing it
          existing_state = test_state.test_state || {}
          
          # Merge sections: combine existing and new sections
          existing_sections = existing_state['sections'] || []
          new_sections = test_update['sections'] || []
          
          # Create a map of existing sections by name for easy lookup
          existing_sections_map = existing_sections.index_by { |s| s['name'] }
          
          # Merge sections: if section exists, merge questions; if new, add it
          merged_sections = existing_sections.map do |existing_section|
            new_section = new_sections.find { |s| s['name'] == existing_section['name'] }
            if new_section
              # Merge questions from new section into existing section
              merged_questions = (existing_section['questions'] || []) + (new_section['questions'] || [])
              existing_section.merge('questions' => merged_questions)
            else
              existing_section
            end
          end
          
          # Add new sections that don't exist yet
          new_sections.each do |new_section|
            unless existing_sections_map[new_section['name']]
              merged_sections << new_section
            end
          end
          
          # Merge other test info (title, description, etc.)
          merged_test_update = existing_state.merge(test_update.except('sections')).merge('sections' => merged_sections)
          
          test_state.update_test_info(merged_test_update)

          render json: {
            message: "Document processed. Here are the generated questions.",
            test_update: merged_test_update,
            conversation_id: conversation.id
          }
        rescue => e
          Rails.logger.error("Error processing file: #{e.message}")
          render json: { error: "Error processing file: #{e.message}" }, status: :internal_server_error
        end
      end

      private

      # Private methods removed - now using ExtractorService
    end
  end
end

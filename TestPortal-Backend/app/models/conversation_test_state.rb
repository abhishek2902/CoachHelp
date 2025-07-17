class ConversationTestState < ApplicationRecord
  acts_as_paranoid
  belongs_to :conversation
  belongs_to :user

  validates :conversation_id, presence: true
  validates :user_id, presence: true

  # Default test state structure
  def self.default_test_state
    {
      title: nil,
      description: nil,
      test_type: nil,
      duration: nil,
      sections: []
    }
  end

  # Initialize with default state if none exists
  after_initialize do |state|
    state.test_state ||= self.class.default_test_state
  end

  # Helper methods to update specific parts of the test state
  def update_section(section_name, questions, duration = nil)
    Rails.logger.info("update_section called with: name=#{section_name}, questions_count=#{questions&.length || 0}, duration=#{duration}")
    Rails.logger.info("Current sections before update: #{test_state['sections']&.inspect}")
    
    current_sections = test_state['sections'] || []
    section_index = current_sections.find_index { |s| s['name'] == section_name }
    
    Rails.logger.info("Section index found: #{section_index}")
    
    # Normalize duration to integer
    normalized_duration = if duration.is_a?(String)
      duration.to_s[/\d+/].to_i
    elsif duration.is_a?(Numeric)
      duration.to_i
    else
      30 # Default to 30 minutes
    end
    
    if section_index
      Rails.logger.info("Updating existing section at index #{section_index}")
      current_sections[section_index]['questions'] = questions
      current_sections[section_index]['duration'] = normalized_duration
    else
      Rails.logger.info("Creating new section: #{section_name}")
      new_section = { 'name' => section_name, 'questions' => questions, 'duration' => normalized_duration }
      current_sections << new_section
    end
    
    test_state['sections'] = current_sections
    Rails.logger.info("Sections after update: #{test_state['sections']&.inspect}")
    
    save_result = save
    Rails.logger.info("Save result: #{save_result}")
    Rails.logger.info("Test state after save: #{test_state.inspect}")
  end

  def remove_section(section_name)
    current_sections = test_state['sections'] || []
    test_state['sections'] = current_sections.reject { |s| s['name'] == section_name }
    save
  end

  def update_test_info(info)
    Rails.logger.info("update_test_info called with: #{info.inspect}")
    Rails.logger.info("Test state before merge: #{test_state.inspect}")
    test_state.merge!(info)
    Rails.logger.info("Test state after merge: #{test_state.inspect}")
    save_result = save
    Rails.logger.info("Save result: #{save_result}")
  end

  def clear_state
    self.test_state = self.class.default_test_state
    save
  end
end 
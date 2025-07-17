class TestCase < ApplicationRecord
  belongs_to :coding_test

  validates :input, presence: true, length: { maximum: 10000 }
  validates :expected_output, presence: true, length: { maximum: 10000 }
  validate :valid_input_format
  validate :valid_output_format
  validate :not_duplicate_test_case

  # Callbacks
  before_save :sanitize_input_output
  after_save :update_coding_test_cache, if: :saved_change_to_input_or_output?

  # Scopes
  scope :ordered, -> { order(:id) }
  scope :with_valid_data, -> { where.not(input: [nil, '']).where.not(expected_output: [nil, '']) }

  def input_lines
    input&.split("\n") || []
  end

  def output_lines
    expected_output&.split("\n") || []
  end

  def input_word_count
    input&.split(/\s+/)&.count || 0
  end

  def output_word_count
    expected_output&.split(/\s+/)&.count || 0
  end

  def complexity_score
    # Simple complexity scoring based on input/output size
    input_complexity = input_lines.length + input_word_count
    output_complexity = output_lines.length + output_word_count
    (input_complexity + output_complexity) / 2.0
  end

  def is_simple_test_case?
    complexity_score <= 10
  end

  def is_complex_test_case?
    complexity_score > 50
  end

  def normalized_input
    input&.strip&.gsub(/\r\n/, "\n")&.gsub(/\r/, "\n")
  end

  def normalized_expected_output
    expected_output&.strip&.gsub(/\r\n/, "\n")&.gsub(/\r/, "\n")
  end

  def matches_actual_output?(actual_output)
    return false if actual_output.blank?
    
    normalized_actual = actual_output.strip.gsub(/\r\n/, "\n").gsub(/\r/, "\n")
    normalized_expected = normalized_expected_output
    
    normalized_actual == normalized_expected
  end

  def to_h
    {
      id: id,
      input: input,
      expected_output: expected_output,
      complexity_score: complexity_score,
      is_simple: is_simple_test_case?,
      is_complex: is_complex_test_case?
    }
  end

  private

  def valid_input_format
    return if input.blank?
    
    # Check for reasonable input size
    if input.length > 10000
      errors.add(:input, "is too long (maximum 10,000 characters)")
    end
    
    # Check for reasonable number of lines
    if input_lines.length > 1000
      errors.add(:input, "has too many lines (maximum 1,000 lines)")
    end
  end

  def valid_output_format
    return if expected_output.blank?
    
    # Check for reasonable output size
    if expected_output.length > 10000
      errors.add(:expected_output, "is too long (maximum 10,000 characters)")
    end
    
    # Check for reasonable number of lines
    if output_lines.length > 1000
      errors.add(:expected_output, "has too many lines (maximum 1,000 lines)")
    end
  end

  def not_duplicate_test_case
    return unless coding_test
    
    existing_cases = coding_test.test_cases.where.not(id: id)
    duplicate = existing_cases.find do |tc|
      tc.normalized_input == normalized_input && 
      tc.normalized_expected_output == normalized_expected_output
    end
    
    if duplicate
      errors.add(:base, "Duplicate test case with same input and expected output")
    end
  end

  def sanitize_input_output
    # Remove null bytes and other control characters
    self.input = input.gsub(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, '') if input.present?
    self.expected_output = expected_output.gsub(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, '') if expected_output.present?
    
    # Normalize line endings
    self.input = input.gsub(/\r\n/, "\n").gsub(/\r/, "\n") if input.present?
    self.expected_output = expected_output.gsub(/\r\n/, "\n").gsub(/\r/, "\n") if expected_output.present?
  end

  def saved_change_to_input_or_output?
    saved_change_to_input? || saved_change_to_expected_output?
  end

  def update_coding_test_cache
    # Clear any cached data related to this test case
    Rails.cache.delete("coding_test_#{coding_test_id}_test_cases")
    Rails.cache.delete("coding_test_#{coding_test_id}_complexity")
  end
end

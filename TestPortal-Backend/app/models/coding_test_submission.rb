class CodingTestSubmission < ApplicationRecord
  belongs_to :coding_test
  belongs_to :test_attempt, optional: true

  validates :solution_code, presence: true, length: { maximum: 50000 }
  validates :language, presence: true, inclusion: { in: %w[javascript python ruby java cpp c] }
  validates :score, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1000 }, allow_nil: true
  validates :submission_type, presence: true
  validate :valid_solution_code
  validate :test_attempt_present_for_final_submission

  enum submission_type: { test_running: 0, submit: 1 }

  # Scopes
  scope :final_submissions, -> { where(submission_type: :submit) }
  scope :test_runs, -> { where(submission_type: :test_running) }
  scope :by_language, ->(language) { where(language: language) }
  scope :recent, -> { order(created_at: :desc) }
  scope :successful, -> { where('score > 0') }
  scope :failed, -> { where(score: 0) }
  
  # Scope to get the latest test run for a specific coding test and test attempt
  scope :latest_test_run, ->(coding_test_id, test_attempt_id) { 
    where(coding_test_id: coding_test_id, test_attempt_id: test_attempt_id, submission_type: :test_running)
    .order(created_at: :desc)
    .limit(1)
  }
  
  # Scope to get the final submission for a specific coding test and test attempt
  scope :final_submission, ->(coding_test_id, test_attempt_id) { 
    where(coding_test_id: coding_test_id, test_attempt_id: test_attempt_id, submission_type: :submit)
    .order(created_at: :desc)
    .limit(1)
  }

  # Callbacks
  before_save :sanitize_solution_code
  before_save :calculate_execution_time
  after_save :update_coding_test_statistics

  # test_results is already a JSON column, no need to serialize

  def passed_tests_count
    return 0 unless test_results.present?
    test_results.count { |result| result['passed'] || result[:passed] }
  end

  def total_tests_count
    return 0 unless test_results.present?
    test_results.count
  end

  def success_rate
    return 0 if total_tests_count == 0
    (passed_tests_count.to_f / total_tests_count * 100).round(2)
  end

  def failed_tests_count
    total_tests_count - passed_tests_count
  end

  def is_perfect_score?
    score == coding_test.marks
  end

  def is_passing_score?
    score >= (coding_test.marks * 0.6) # 60% threshold
  end

  def execution_time_ms
    return 0 unless test_results.present?
    
    total_time = test_results.sum do |result|
      result['execution_time'] || result[:execution_time] || 0
    end
    
    total_time.round(2)
  end

  def average_execution_time_ms
    return 0 if total_tests_count == 0
    (execution_time_ms / total_tests_count).round(2)
  end

  def has_compilation_errors?
    return false unless test_results.present?
    
    test_results.any? do |result|
      errors = result['errors'] || result[:errors]
      errors.present? && errors.any? { |error| error.include?('compilation') || error.include?('syntax') }
    end
  end

  def has_runtime_errors?
    return false unless test_results.present?
    
    test_results.any? do |result|
      errors = result['errors'] || result[:errors]
      errors.present? && errors.any? { |error| error.include?('runtime') || error.include?('exception') }
    end
  end

  def error_summary
    return [] unless test_results.present?
    
    all_errors = []
    test_results.each_with_index do |result, index|
      errors = result['errors'] || result[:errors]
      if errors.present?
        all_errors << {
          test_case: index + 1,
          errors: errors
        }
      end
    end
    
    all_errors
  end

  def code_complexity_score
    return 0 if solution_code.blank?
    
    lines = solution_code.split("\n")
    non_empty_lines = lines.reject { |line| line.strip.empty? }
    
    # Simple complexity calculation
    complexity = 0
    complexity += non_empty_lines.length * 0.5 # Base complexity per line
    complexity += solution_code.scan(/if|while|for|foreach/).length * 2 # Control structures
    complexity += solution_code.scan(/function|def|class/).length * 3 # Function/class definitions
    
    complexity.round(2)
  end

  def code_length
    solution_code&.length || 0
  end

  def line_count
    return 0 if solution_code.blank?
    solution_code.split("\n").length
  end

  def non_empty_line_count
    return 0 if solution_code.blank?
    solution_code.split("\n").reject { |line| line.strip.empty? }.length
  end

  def to_h
    {
      id: id,
      coding_test_id: coding_test_id,
      test_attempt_id: test_attempt_id,
      language: language,
      score: score,
      submission_type: submission_type,
      passed_tests: passed_tests_count,
      total_tests: total_tests_count,
      success_rate: success_rate,
      execution_time: execution_time_ms,
      average_execution_time: average_execution_time_ms,
      code_complexity: code_complexity_score,
      code_length: code_length,
      line_count: line_count,
      has_compilation_errors: has_compilation_errors?,
      has_runtime_errors: has_runtime_errors?,
      created_at: created_at
    }
  end

  private

  def valid_solution_code
    return if solution_code.blank?
    
    # Check for dangerous code patterns
    dangerous_patterns = [
      /eval\s*\(/i,
      /exec\s*\(/i,
      /system\s*\(/i,
      /`.*`/, # Backticks for command execution
      /File\.delete/,
      /Dir\.delete/,
      /Process\.kill/,
      /Kernel\.exit/,
      /require\s*\(/,
      /import\s*\(/,
      /__import__/,
      /compile\s*\(/,
      /exec\s*\(/,
      /eval\s*\(/
    ]
    
    dangerous_patterns.each do |pattern|
      if solution_code.match?(pattern)
        errors.add(:solution_code, "contains potentially dangerous code patterns")
        break
      end
    end
    
    # Check for reasonable code size
    if solution_code.length > 50000
      errors.add(:solution_code, "is too long (maximum 50,000 characters)")
    end
    
    # Check for reasonable number of lines
    if solution_code.split("\n").length > 2000
      errors.add(:solution_code, "has too many lines (maximum 2,000 lines)")
    end
  end

  def test_attempt_present_for_final_submission
    if submission_type == 'submit' && test_attempt_id.blank?
      errors.add(:test_attempt_id, "is required for final submissions")
    end
  end

  def sanitize_solution_code
    return if solution_code.blank?
    
    # Remove null bytes and other control characters
    self.solution_code = solution_code.gsub(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, '')
    
    # Normalize line endings
    self.solution_code = solution_code.gsub(/\r\n/, "\n").gsub(/\r/, "\n")
    
    # Remove trailing whitespace from lines
    lines = solution_code.split("\n")
    lines.map!(&:rstrip)
    self.solution_code = lines.join("\n")
  end

  def calculate_execution_time
    return unless test_results.present?
    
    total_time = test_results.sum do |result|
      result['execution_time'] || result[:execution_time] || 0
    end
    
    # Store in a virtual attribute or use a separate column if needed
    @calculated_execution_time = total_time
  end

  def update_coding_test_statistics
    # Clear cached statistics for this coding test
    Rails.cache.delete("coding_test_#{coding_test_id}_statistics")
    Rails.cache.delete("coding_test_#{coding_test_id}_submissions_count")
  end
end

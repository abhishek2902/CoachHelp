class CodingTest < ApplicationRecord
  belongs_to :section
  has_many :test_cases, dependent: :destroy
  has_many :coding_test_submissions, dependent: :destroy

  validates :title, presence: true, length: { maximum: 255 }
  validates :description, presence: true, length: { maximum: 10000 }
  validates :marks, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1000 }
  validates :difficulty, presence: true, inclusion: { in: %w[easy medium hard] }
  validates :boilerplate_code, length: { maximum: 50000 }
  validate :has_test_cases_when_published
  validate :valid_boilerplate_code

  enum difficulty: { easy: 0, medium: 1, hard: 2 }

  accepts_nested_attributes_for :test_cases, allow_destroy: true, reject_if: :all_blank

  # Virtual attribute for frontend temporary ID
  attr_accessor :frontend_temp_id

  # Scopes
  scope :by_difficulty, ->(difficulty) { where(difficulty: difficulty) }
  scope :with_test_cases, -> { includes(:test_cases) }
  scope :published, -> { joins(:section).where(sections: { test: { status: 'published' } }) }

  # Callbacks
  before_save :sanitize_code
  after_save :update_test_total_marks, if: :saved_change_to_marks?

  def total_test_cases
    test_cases.count
  end

  def average_score
    return 0 if coding_test_submissions.empty?
    
    total_score = coding_test_submissions.final_submissions.sum(:score)
    total_submissions = coding_test_submissions.final_submissions.count
    
    total_submissions > 0 ? (total_score.to_f / total_submissions).round(2) : 0
  end

  def success_rate
    return 0 if coding_test_submissions.final_submissions.empty?
    
    passed_submissions = coding_test_submissions.final_submissions.joins(:coding_test)
                                 .where('coding_test_submissions.score >= coding_tests.marks')
                                 .count
    
    total_submissions = coding_test_submissions.final_submissions.count
    (passed_submissions.to_f / total_submissions * 100).round(2)
  end

  def test_case_count
    test_cases.count
  end

  def has_valid_test_cases?
    test_cases.any? && test_cases.all? { |tc| tc.input.present? && tc.expected_output.present? }
  end

  def can_be_published?
    title.present? && description.present? && marks.present? && has_valid_test_cases?
  end

  private

  def has_test_cases_when_published
    if section&.test&.status == 'published' && test_cases.empty?
      errors.add(:base, "Coding test must have at least one test case to be published")
    end
  end

  def valid_boilerplate_code
    return if boilerplate_code.blank?
    
    # Check for potentially dangerous code patterns
    dangerous_patterns = [
      /eval\s*\(/i,
      /exec\s*\(/i,
      /system\s*\(/i,
      /`.*`/, # Backticks for command execution
      /File\.delete/,
      /Dir\.delete/,
      /Process\.kill/,
      /Kernel\.exit/
    ]
    
    dangerous_patterns.each do |pattern|
      if boilerplate_code.match?(pattern)
        errors.add(:boilerplate_code, "contains potentially dangerous code patterns")
        break
      end
    end
  end

  def sanitize_code
    return if boilerplate_code.blank?
    
    # Remove any null bytes and other control characters
    self.boilerplate_code = boilerplate_code.gsub(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, '')
    
    # Limit line length to prevent display issues
    lines = boilerplate_code.split("\n")
    lines.map! { |line| line.length > 200 ? line[0..200] + "..." : line }
    self.boilerplate_code = lines.join("\n")
  end

  def update_test_total_marks
    return unless section&.test
    
    # Recalculate test total marks when coding test marks change
    test = section.test
    total_marks = test.sections.sum do |s|
      s.questions.sum(:marks) + s.coding_tests.sum(:marks)
    end
    
    test.update_column(:total_marks, total_marks) if test.total_marks != total_marks
  end
end

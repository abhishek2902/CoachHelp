class TestAttempt < ApplicationRecord
  belongs_to :test
  has_one :feedback, dependent: :destroy
  has_one :face_detection_screenshot, dependent: :destroy
  has_many :coding_test_submissions, dependent: :destroy
  attribute :answers, :json, default: {}
  validates :email, presence: true, format: { with: /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/, message: "is invalid" }
  validates :email, uniqueness: { scope: :test_id, message: "for this test already exist" }

  after_save :invalidate_ai_context_cache
  after_destroy :invalidate_ai_context_cache

  def invalidate_ai_context_cache
    Rails.cache.delete("ai_context_data_test_#{self.test_id}")
  end

  def generate_and_send_otp
    self.otp = rand(100000..999999).to_s
    self.otp_sent_at = Time.current
    save!
    TestAttemptMailer.send_otp(self, otp).deliver_now
  end

  def verify_otp(entered_otp)
    return false if otp.blank? || otp_sent_at.blank?
    return false if Time.current - otp_sent_at > 10.minutes
    return false if otp != entered_otp

    self.email_verified = true
    save!
  end

  # Calculate total score including coding test scores
  def calculate_total_score
    regular_score = marks || 0
    coding_score = coding_test_submissions.final_submissions.sum(:score) || 0
    regular_score + coding_score
  end

  # Get all coding tests for this test attempt
  def coding_tests
    test.sections.joins(:coding_tests).includes(:coding_tests)
  end

  # Get the current state of coding tests (latest test runs and final submissions)
  def coding_test_states
    coding_tests_data = []
    
    test.sections.includes(:coding_tests).each do |section|
      section.coding_tests.each do |coding_test|
        latest_test_run = coding_test_submissions.latest_test_run(coding_test.id, id).first
        final_submission = coding_test_submissions.final_submission(coding_test.id, id).first
        
        coding_tests_data << {
          coding_test_id: coding_test.id,
          title: coding_test.title,
          marks: coding_test.marks,
          latest_test_run: latest_test_run&.as_json(include: :coding_test),
          final_submission: final_submission&.as_json(include: :coding_test),
          has_final_submission: final_submission.present?
        }
      end
    end
    
    coding_tests_data
  end
end

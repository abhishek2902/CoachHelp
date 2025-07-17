class Test < ApplicationRecord
  validate :valid_time_window
  belongs_to :user
  
  has_many :sections, -> { order(id: :asc) }, dependent: :destroy

  has_many :questions, through: :sections, dependent: :destroy

  has_many :test_attempts, dependent: :destroy
  has_many :face_detection_screenshots, dependent: :destroy

  before_create :generate_test_code_if_published
  before_update :handle_test_code_on_update

  extend FriendlyId
  friendly_id :title, use: :slugged

  accepts_nested_attributes_for :sections, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :questions, allow_destroy: true, reject_if: :all_blank

  # validates :title, presence: true, unless: -> { status == 'draft' }
  validates :title, :duration, presence: true, unless: -> { status.in?(%w[draft pending]) }

  #validate :sections_have_questions, if: -> { status == 'published' }
  belongs_to :conversation, optional: true

  def published?
    status == "published"
  end

  def draft?
    status == "draft" || status == "unpublish" || status == "pending"
  end

  def accessible_now?
    return true if link_expires_date.nil? && access_start_time.nil? && access_end_time.nil?

    return false if link_expires_date.present? && Date.current > link_expires_date

    if access_start_time && access_end_time
      now = Time.current
      today = Date.current

      start_time = Time.zone.parse("#{today} #{access_start_time.strftime('%H:%M')}")
      end_time   = Time.zone.parse("#{today} #{access_end_time.strftime('%H:%M')}")

      return now >= start_time && now <= end_time
    end

    false
  end

  def within_access_window?
    return true unless access_start_time && access_end_time

    now = Time.current
    start_time = now.change(hour: access_start_time.hour, min: access_start_time.min)
    end_time   = now.change(hour: access_end_time.hour, min: access_end_time.min)

    start_time <= now && now <= end_time
  end

  private

  def generate_test_code_if_published
    return unless published?

    self.test_code = generate_unique_test_code
  end

  def handle_test_code_on_update
    if draft?
      self.test_code = nil
    else
      self.test_code = generate_unique_test_code
    end
  end

  def generate_unique_test_code
    loop do
      code = SecureRandom.alphanumeric(6).upcase
      break code unless Test.exists?(test_code: code)
    end
  end

  def sections_have_questions
    if sections.any? { |section| section.questions.empty? }
      errors.add(:base, "Each section must have at least one question to publish.")
    end
  end

  def valid_time_window
    if access_start_time && access_end_time && access_start_time >= access_end_time
      errors.add(:access_end_time, "must be after access start time")
    end
  end
end

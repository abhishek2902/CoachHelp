class Training < ApplicationRecord
  extend FriendlyId

  friendly_id :title, use: :slugged
  belongs_to :user

  has_many :training_sections, inverse_of: :training, dependent: :destroy
  has_many :training_questions, through: :training_sections
  accepts_nested_attributes_for :training_sections, allow_destroy: true

  has_many_attached :pdf_files
  has_many_attached :video_files

  has_many :training_enrollments, dependent: :destroy
  has_many :enrolled_users, through: :training_enrollments, source: :user

  before_create :generate_code_if_published
  before_update :handle_code_on_update

  enum status: { draft: "draft", published: "published", archived: "archived" }

  validates :title, presence: true
  validates :status, presence: true

  def published?
    status == "published"
  end

  def draft?
    status == "draft" || status == "unpublish" || status == "pending"
  end

  private

  def generate_code_if_published
    return unless published?

    self.code = generate_unique_code
  end

  def handle_code_on_update
    if draft?
      self.code = nil
    else
      self.code = generate_unique_code
    end
  end

  def generate_unique_code
    loop do
      code = SecureRandom.alphanumeric(6).upcase
      break code unless Training.exists?(code: code)
    end
  end

  def sections_have_questions
    if sections.any? { |section| section.questions.empty? }
      errors.add(:base, "Each section must have at least one question to publish.")
    end
  end
end

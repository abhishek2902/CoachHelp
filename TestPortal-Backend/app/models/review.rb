class Review < ApplicationRecord
  belongs_to :user

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :user_id, uniqueness: true
  validates :slug, presence: true, uniqueness: true
  validates :title, presence: true

  before_validation :generate_slug, on: :create

  attribute :show_in_public, :boolean, default: false

  private

  def generate_slug
    self.slug ||= "review-#{user_id}-#{SecureRandom.hex(4)}"
  end
end

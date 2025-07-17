class Help < ApplicationRecord
  validates :title, :slug, presence: true
  validates :slug, uniqueness: true

  before_validation :generate_slug, on: :create

  default_scope { order(position: :asc) }

  private

  def generate_slug
    self.slug ||= title.to_s.parameterize
  end
end 
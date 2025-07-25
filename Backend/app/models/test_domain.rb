class TestDomain < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged
  has_many :categories, dependent: :destroy
  validates :name, presence: true, uniqueness: true
end

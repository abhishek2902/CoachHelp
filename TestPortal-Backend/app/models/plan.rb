class Plan < ApplicationRecord
  # has_many :subscriptions, dependent: :destroy
  # has_many :subscriptions

  validates :name, :price, :interval, presence: true
end

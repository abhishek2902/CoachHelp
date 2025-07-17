class Payment < ApplicationRecord
  belongs_to :user
  belongs_to :subscription

  validates :amount, :status, :paid_at, presence: true
end

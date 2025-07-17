class Subscription < ApplicationRecord
  belongs_to :user
  belongs_to :plan
  has_one :payment, dependent: :destroy
  has_many :invoices, dependent: :destroy

  validates :status, presence: true

  scope :active_subscriptions, -> { where(status: "active") }

  def active?
    status == 'active' && end_date > Time.current
  end

    def check_and_update_status!
    if tests_remaining <= 0 || end_date.past?
      update!(status: 'inactive')
    end
  end
end

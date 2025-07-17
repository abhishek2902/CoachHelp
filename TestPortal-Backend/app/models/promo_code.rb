class PromoCode < ApplicationRecord
  validates :code, presence: true, uniqueness: true
  validates :discount, numericality: { greater_than: 0 }

  def expired?
    expires_at.present? && Time.current > expires_at
  end

  def usable?
    active && !expired? && (usage_limit.nil? || usage_count.to_i < usage_limit)
  end

  def apply!
    increment!(:usage_count)
  end
end

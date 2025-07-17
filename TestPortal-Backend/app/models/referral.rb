class Referral < ApplicationRecord
  belongs_to :user
  belongs_to :referrer_user, class_name: 'User', foreign_key: 'referred_by_code', primary_key: 'referral_code', optional: true
  validates :referred_by_code, presence: true, if: -> { referred_by_code.present? }
end
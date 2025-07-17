class RemoveReferralCodeFromReferrals < ActiveRecord::Migration[7.1]
  def change
    remove_column :referrals, :referral_code, :string
  end
end
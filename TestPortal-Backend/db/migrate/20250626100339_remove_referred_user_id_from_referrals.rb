class RemoveReferredUserIdFromReferrals < ActiveRecord::Migration[7.1]
  def change
    remove_column :referrals, :referred_user_id, :integer
  end
end
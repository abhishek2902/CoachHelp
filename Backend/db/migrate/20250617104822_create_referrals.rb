class CreateReferrals < ActiveRecord::Migration[7.1]
  def change
    create_table :referrals do |t|
      t.references :user, null: false, foreign_key: true
      t.string :referral_code
      t.string :referred_by_code
      t.boolean :referral_rewarded, default: false
      t.string :subscription_status, default: "none"

      t.timestamps
    end
    add_column :referrals, :cash_benefit, :integer, default: 0
    add_reference :referrals, :referred_user, foreign_key: { to_table: :users }
    add_index :referrals, :referral_code, unique: true
  end
end
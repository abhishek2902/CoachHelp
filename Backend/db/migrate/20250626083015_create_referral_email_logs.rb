class CreateReferralEmailLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :referral_email_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.string :recipient_email
      t.datetime :sent_at

      t.timestamps
    end
  end
end
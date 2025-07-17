class AddOtpFieldsToTestAttempts < ActiveRecord::Migration[7.1]
  def change
    add_column :test_attempts, :otp, :string
    add_column :test_attempts, :otp_sent_at, :datetime
    add_column :test_attempts, :email_verified, :boolean, default: false
  end
end 
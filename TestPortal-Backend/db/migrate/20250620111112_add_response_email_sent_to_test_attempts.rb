class AddResponseEmailSentToTestAttempts < ActiveRecord::Migration[7.1]
  def change
    add_column :test_attempts, :response_email_sent, :boolean
  end
end

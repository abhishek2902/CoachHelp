class AddGuestTokenToTestAttempts < ActiveRecord::Migration[7.1]
  def change
    add_column :test_attempts, :guest_token, :string
    add_index :test_attempts, :guest_token, unique: true
  end
end

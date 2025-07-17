class RemoveUserIdFromTestAttempts < ActiveRecord::Migration[7.1]
  def change
    remove_reference :test_attempts, :user, null: false, foreign_key: true
  end
end

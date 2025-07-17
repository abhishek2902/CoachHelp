class AddAnswersToTestAttempts < ActiveRecord::Migration[7.1]
  def change
    add_column :test_attempts, :answers, :json
  end
end

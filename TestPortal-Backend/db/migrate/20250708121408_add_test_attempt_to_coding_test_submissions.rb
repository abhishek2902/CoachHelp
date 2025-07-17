class AddTestAttemptToCodingTestSubmissions < ActiveRecord::Migration[7.1]
  def change
    add_reference :coding_test_submissions, :test_attempt, null: true, foreign_key: true
    add_index :coding_test_submissions, [:test_attempt_id, :coding_test_id]
  end
end

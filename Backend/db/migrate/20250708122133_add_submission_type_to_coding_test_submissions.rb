class AddSubmissionTypeToCodingTestSubmissions < ActiveRecord::Migration[7.1]
  def change
    add_column :coding_test_submissions, :submission_type, :integer, default: 0
    add_index :coding_test_submissions, :submission_type
  end
end

class AddQuestionWiseMarksToTestAttempts < ActiveRecord::Migration[7.1]
  def change
    add_column :test_attempts, :question_wise_marks_obtained, :json
  end
end

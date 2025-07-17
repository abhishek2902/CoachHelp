class RemoveTrainingIdFromTrainingQuestions < ActiveRecord::Migration[7.1]
  def change
    remove_column :training_questions, :training_id, :bigint
  end
end

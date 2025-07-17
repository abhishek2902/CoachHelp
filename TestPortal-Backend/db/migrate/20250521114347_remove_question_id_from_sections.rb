class RemoveQuestionIdFromSections < ActiveRecord::Migration[7.1]
  def change
    remove_column :sections, :question_id, :integer
  end
end

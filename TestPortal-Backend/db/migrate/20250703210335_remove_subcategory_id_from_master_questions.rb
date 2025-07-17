class RemoveSubcategoryIdFromMasterQuestions < ActiveRecord::Migration[7.1]
  def change
    remove_column :master_questions, :subcategory_id, :integer
  end
end

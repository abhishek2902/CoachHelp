class AddCategoryIdToMasterQuestions < ActiveRecord::Migration[7.1]
  def change
    add_column :master_questions, :category_id, :integer
  end
end

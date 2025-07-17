class AddFrontendTempIdToSectionsAndQuestions < ActiveRecord::Migration[7.0]
  def change
    add_column :sections, :frontend_temp_id, :string
    add_column :questions, :frontend_temp_id, :string

    add_index :sections, :frontend_temp_id
    add_index :questions, :frontend_temp_id
  end
end

class AddParentIdToCategories < ActiveRecord::Migration[7.1]
  def change
    add_column :categories, :parent_id, :integer
  end
end

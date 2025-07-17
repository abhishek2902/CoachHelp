class DropSubcategoriesTable < ActiveRecord::Migration[7.1]
  def change
    remove_foreign_key :master_tests, :subcategories if foreign_key_exists?(:master_tests, :subcategories)
    drop_table :subcategories, if_exists: true
  end
end

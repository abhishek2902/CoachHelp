class AddFrontendTempIdToCodingTests < ActiveRecord::Migration[7.1]
  def change
    add_column :coding_tests, :frontend_temp_id, :string
    add_index :coding_tests, :frontend_temp_id
  end
end

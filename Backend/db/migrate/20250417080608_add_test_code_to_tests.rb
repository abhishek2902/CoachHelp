class AddTestCodeToTests < ActiveRecord::Migration[7.1]
  def change
    add_column :tests, :test_code, :string
    add_index :tests, :test_code, unique: true
  end
end

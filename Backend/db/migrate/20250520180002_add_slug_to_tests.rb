class AddSlugToTests < ActiveRecord::Migration[7.1]
  def change
    add_column :tests, :slug, :string
    add_index :tests, :slug, unique: true
  end
end

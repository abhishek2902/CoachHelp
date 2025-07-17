class CreateTests < ActiveRecord::Migration[7.1]
  def change
    create_table :tests do |t|
      t.string :title
      t.text :description
      t.integer :total_marks
      t.integer :timer
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end

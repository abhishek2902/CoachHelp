class CreateReviews < ActiveRecord::Migration[7.1]
  def change
    create_table :reviews do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :rating
      t.text :comment
      t.string :slug

      t.timestamps
    end
    add_index :reviews, :slug, unique: true
  end
end

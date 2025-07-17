class CreateCodingTests < ActiveRecord::Migration[7.1]
  def change
    create_table :coding_tests do |t|
      t.text :description
      t.string :title
      t.integer :marks, default: 0
      t.text :boilerplate_code
      t.integer :difficulty, default: 0
      t.references :section, null: false, foreign_key: true

      t.timestamps
    end
  end
end

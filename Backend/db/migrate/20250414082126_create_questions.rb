class CreateQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table :questions do |t|
      t.references :test, null: false, foreign_key: true
      t.text :content
      t.string :option_a
      t.string :option_b
      t.string :option_c
      t.string :option_d
      t.string :correct_option
      t.integer :marks

      t.timestamps
    end
  end
end

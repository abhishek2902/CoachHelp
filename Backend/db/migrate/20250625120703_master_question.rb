class MasterQuestion < ActiveRecord::Migration[7.1]
  def change
    create_table :master_questions do |t|
      t.text :content
      t.text :code_snippet
      t.string :option_1
      t.string :option_2
      t.string :option_3
      t.string :option_4
      t.string :correct_answer
      t.string :language # for code snippet (e.g., ruby, python, c++)
      t.string :question_type
      t.integer :marks, default: 1
      t.references :subcategory, null: false, foreign_key: true

      t.timestamps
    end
  end
end

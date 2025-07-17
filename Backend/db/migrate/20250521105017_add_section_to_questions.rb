class AddSectionToQuestions < ActiveRecord::Migration[7.1]
  def change
    add_reference :questions, :section, null: true, foreign_key: true
    add_reference :sections, :test, null: false, foreign_key: true
    add_reference :sections, :question, null: false, foreign_key: true
  end
end

class ChangeOptionsAndCorrectAnswerToTextInQuestions < ActiveRecord::Migration[7.1]
  def change
    change_column :questions, :option_1, :text
    change_column :questions, :option_2, :text
    change_column :questions, :option_3, :text
    change_column :questions, :option_4, :text
    change_column :questions, :correct_answer, :text
  end
end 
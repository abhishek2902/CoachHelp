class UpdateQuestionsTable < ActiveRecord::Migration[7.1]
  def change
    # Remove the `option_json` column
    remove_column :questions, :option_json, :jsonb

    # Add new columns for the options
    add_column :questions, :option_1, :string
    add_column :questions, :option_2, :string
    add_column :questions, :option_3, :string
    add_column :questions, :option_4, :string

    # Change the `correct_answer` field from jsonb to string
    change_column :questions, :correct_answer, :string, default: ''
  end
end

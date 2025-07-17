class UpdateTestsAndQuestions < ActiveRecord::Migration[7.1]
  def change

     # Remove old fields
    remove_column :tests, :timer, :integer

    # For tests table
    add_column :tests, :test_type, :string
    add_column :tests, :duration, :integer
    add_column :tests, :average_score, :float, default: 0.0
    add_column :tests, :completed_test, :integer, default: 0
    add_column :tests, :avg_completed_time, :float
    add_column :tests, :passed, :integer, default: 0
    add_column :tests, :failed, :integer, default: 0
    add_column :tests, :status, :string, default: "draft"
 
         # Remove old fields
    remove_column :questions, :option_a, :string
    remove_column :questions, :option_b, :string
    remove_column :questions, :option_c, :string
    remove_column :questions, :option_d, :string
    remove_column :questions, :correct_option, :string

     # Add new fields
    add_column :questions, :question_type, :string
    add_column :questions, :option_json, :jsonb, default: []
    add_column :questions, :correct_answer, :jsonb, default: []
    add_column :questions, :tags, :string

  end
end

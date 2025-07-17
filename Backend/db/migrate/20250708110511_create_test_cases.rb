class CreateTestCases < ActiveRecord::Migration[7.1]
  def change
    create_table :test_cases do |t|
      t.text :input
      t.text :expected_output
      t.references :coding_test, null: false, foreign_key: true

      t.timestamps
    end
  end
end

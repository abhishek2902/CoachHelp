class CreateCodingTestSubmissions < ActiveRecord::Migration[7.1]
  def change
    create_table :coding_test_submissions do |t|
      t.references :coding_test, null: false, foreign_key: true
      t.text :solution_code
      t.string :language
      t.decimal :score
      t.json :test_results
      t.string :submitted_by

      t.timestamps
    end
  end
end

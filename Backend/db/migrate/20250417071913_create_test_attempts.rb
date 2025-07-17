class CreateTestAttempts < ActiveRecord::Migration[7.1]
  def change
    create_table :test_attempts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :test, null: false, foreign_key: true
      t.datetime :started_at
      t.datetime :completed_at
      t.float :score

      t.timestamps
    end
  end
end

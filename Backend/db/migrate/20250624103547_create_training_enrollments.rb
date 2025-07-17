class CreateTrainingEnrollments < ActiveRecord::Migration[7.1]
  def change
    create_table :training_enrollments do |t|
      t.references :training, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.string :status, default: "not_started"
      t.jsonb :responses_json, default: {}
      t.integer :questions_attempted, default: 0
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end
  end
end

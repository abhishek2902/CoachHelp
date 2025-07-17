class CreateAiTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :ai_tasks do |t|
      t.references :conversation, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :status
      t.text :request_payload
      t.text :result
      t.text :error

      t.timestamps
    end
  end
end

class CreateTrainings < ActiveRecord::Migration[7.0]
  def change
    create_table :trainings do |t|
      t.string :title
      t.text :description
      t.text :content_html
      t.string :code
      t.references :user, null: false, foreign_key: true  # creator
      t.integer :avg_completed_time
      t.integer :duration
      t.boolean :allow_retries, default: false
      t.string :status, default: 'draft'

      t.timestamps
    end
  end
end

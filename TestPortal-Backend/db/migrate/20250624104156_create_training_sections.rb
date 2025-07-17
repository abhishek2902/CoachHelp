class CreateTrainingSections < ActiveRecord::Migration[7.1]
  def change
    create_table "training_sections", force: :cascade do |t|
      t.string "name"
      t.integer "duration"
      t.string "frontend_temp_id"
      t.bigint "training_id", null: false
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["frontend_temp_id"], name: "index_training_sections_on_frontend_temp_id"
      t.index ["training_id"], name: "index_training_sections_on_training_id"
    end
  end
end

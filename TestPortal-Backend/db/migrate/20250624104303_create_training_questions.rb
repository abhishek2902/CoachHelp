class CreateTrainingQuestions < ActiveRecord::Migration[7.1]
  def change
    create_table "training_questions", force: :cascade do |t|
      t.bigint "training_section_id", null: false
      t.bigint "training_id", null: false
      t.text "content"
      t.integer "marks"
      t.string "question_type"
      t.text "correct_answer", default: ""
      t.string "tags"
      t.text "option_1"
      t.text "option_2"
      t.text "option_3"
      t.text "option_4"
      t.string "frontend_temp_id"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["frontend_temp_id"], name: "index_training_questions_on_frontend_temp_id"
      t.index ["training_id"], name: "index_training_questions_on_training_id"
      t.index ["training_section_id"], name: "index_training_questions_on_training_section_id"
    end
  end
end

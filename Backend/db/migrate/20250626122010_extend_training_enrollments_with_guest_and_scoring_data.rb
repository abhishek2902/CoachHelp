class ExtendTrainingEnrollmentsWithGuestAndScoringData < ActiveRecord::Migration[7.1]
    def change
    change_table :training_enrollments do |t|
      t.string   :name
      t.string   :email
      t.string   :mobile
      t.string   :institute
      t.float    :score
      t.integer  :marks
      t.jsonb    :answers, default: {}
      t.jsonb    :question_wise_marks_obtained, default: {}
      t.boolean  :response_email_sent, default: false
    end

  end
end

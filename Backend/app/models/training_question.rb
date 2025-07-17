class TrainingQuestion < ApplicationRecord
  belongs_to :training_section, inverse_of: :training_questions

  validates :content, :question_type, presence: true
end

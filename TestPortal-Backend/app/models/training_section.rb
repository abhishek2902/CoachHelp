class TrainingSection < ApplicationRecord
  belongs_to :training, inverse_of: :training_sections

  has_many :training_questions, inverse_of: :training_section, dependent: :destroy
  accepts_nested_attributes_for :training_questions, allow_destroy: true
end

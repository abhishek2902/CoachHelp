class MasterQuestion < ApplicationRecord
  extend FriendlyId
  friendly_id :content, use: :slugged
	belongs_to :category

  validates :content, presence: true
  validates :question_type, presence: true
  validates :marks, presence: true, numericality: { only_integer: true, greater_than: 0 }

  with_options if: -> { question_type.in?(%w[MCQ MSQ]) } do
    validates :option_1, :option_2, :option_3, :option_4, presence: true
    validates :correct_answer, presence: true

    # For MCQ: correct_answer should be one of 1,2,3,4
    validates :correct_answer,
              inclusion: { in: %w[1 2 3 4] },
              if: -> { question_type == 'MCQ' }

    # For MSQ: comma-separated list of 1–4
    validates :correct_answer,
              format: { with: /\A(\d,?)+\z/, message: 'must be a comma separated list of option numbers' },
              if: -> { question_type == 'MSQ' }
  end

  with_options if: -> { question_type == 'theoretical' } do
    validates :correct_answer, presence: true
    # No options required for theoretical
  end
end

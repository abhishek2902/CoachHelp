class TrainingEnrollment < ApplicationRecord
  belongs_to :training
  belongs_to :user

  enum status: {
    not_started: "not_started",
    in_progress: "in_progress",
    completed: "completed",
    expired: "expired"
  }

  validates :status, presence: true

  def calculate_score!
    return unless responses_json.present? && training.present?

    total_score = 0
    total_marks = 0
    question_wise_scores = {}

    training.training_sections.includes(:training_questions).each do |section|
      section.training_questions.each do |q|
        raw = responses_json[q.id.to_s]

        # Normalize format
        given = if raw.is_a?(Hash) && raw["answer"]
                  raw["answer"]
                elsif raw.is_a?(String)
                  raw.split(',') # Handles "1", "1,2" etc.
                elsif raw.is_a?(Array)
                  raw
                else
                  []
                end

        correct = q.correct_answer
        total_marks += q.marks.to_i

        if q.question_type == "theoretical"
          question_wise_scores[q.id.to_s] = nil
          next
        end

        given_normal = Array(given).flat_map { |a| a.to_s.split(',') }.map(&:strip).sort
        correct_normal = Array(correct).flat_map { |a| a.to_s.split(',') }.map(&:strip).sort

        if given_normal == correct_normal
          total_score += q.marks.to_f
          question_wise_scores[q.id.to_s] = q.marks.to_f
        else
          question_wise_scores[q.id.to_s] = 0
        end
      end
    end

    self.score = total_score
    self.marks = total_marks
    self.question_wise_marks_obtained = question_wise_scores
  end
end

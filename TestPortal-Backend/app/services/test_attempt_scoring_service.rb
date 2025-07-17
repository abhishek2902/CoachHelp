# app/services/test_attempt_scoring_service.rb
class TestAttemptScoringService
  def initialize(test_attempt, submission)
    @test_attempt = test_attempt
    @test = test_attempt.test
    @answers = test_attempt.answers || {}
    @question_marks = []
    @theoretical_inputs = []
    @total_score = 0
    @submission = submission
  end

  def call
    return unless @test.present?

    Rails.logger.debug "Starting scoring service for test attempt #{@test_attempt.id}"
    Rails.logger.debug "Answers: #{@answers}"

    # Process regular questions
    @test.questions.order(:id).each do |q|
      Rails.logger.debug "Processing question #{q.id}: #{q.question_type}"
      process_question(q)
    end

    Rails.logger.debug "Theoretical inputs count: #{@theoretical_inputs.count}"
    # Temporarily skip AI evaluation for testing
    # process_theoretical_answers if @theoretical_inputs.any?
    if @theoretical_inputs.any?
      Rails.logger.debug "Skipping AI evaluation for #{@theoretical_inputs.count} theoretical questions"
      @theoretical_inputs.each do |input|
        @question_marks << {
          question_id: input[:question_id],
          marks_awarded: 0, # Give 0 marks for now
          max_marks: input[:marks],
          given_answer: input[:given],
          note: "AI evaluation temporarily disabled"
        }
      end
    end

    # Add coding test scores
    Rails.logger.debug "Calculating coding test scores"
    coding_test_score = calculate_coding_test_score
    Rails.logger.debug "Coding test score: #{coding_test_score}"

    @test_attempt.marks = @total_score + coding_test_score
    @test_attempt.question_wise_marks_obtained = @question_marks.sort_by { |qm| qm[:question_id] || qm["question_id"] }

    if @submission[:submission] == "true"
      @test_attempt.completed_at = Time.current
      Rails.logger.debug "Marking test as completed"
    end

    Rails.logger.debug "Scoring service completed. Total score: #{@test_attempt.marks}"
    @test_attempt
  end

  private

  def process_question(q)
    given = @answers[q.id.to_s]
    correct = q.correct_answer
    marks_awarded = 0
    max_marks = q.marks || 0
    type = q.question_type.to_s.downcase

    if type == "theoretical"
      @theoretical_inputs << {
        question_id: q.id,
        question: q.content,
        expected: correct,
        given: given,
        marks: max_marks
      }
      return
    end

    if %w[mcq msq].include?(type)
      given_normal = given.to_s.split(',').map(&:strip).map(&:downcase).sort
      correct_normal = correct.to_s.split(',').map(&:strip).map(&:downcase).sort

      if given_normal == correct_normal
        marks_awarded = max_marks
        @total_score += marks_awarded
      end
    end

    @question_marks << {
      question_id: q.id,
      marks_awarded: marks_awarded,
      max_marks: max_marks,
      given_answer: given
    }
  end

  def process_theoretical_answers
    ai_results = EvaluateTheoreticalAnswersService.new(@theoretical_inputs).call

    if ai_results[:success]
      ai_results[:results].each do |result|
        if result[:error]
          @question_marks << {
            question_id: result[:question_id],
            marks_awarded: 0,
            max_marks: result[:max_marks],
            given_answer: result[:given],
            error: result[:details]
          }
        else
          @total_score += result[:marks_awarded]
          @question_marks << {
            question_id: result[:question_id],
            marks_awarded: result[:marks_awarded],
            max_marks: result[:max_marks],
            given_answer: result[:given]
          }
        end
      end
    else
      @theoretical_inputs.each do |input|
        @question_marks << {
          question_id: input[:question_id],
          marks_awarded: 0,
          max_marks: input[:max_marks],
          given_answer: input[:given],
          error: ai_results[:error]
        }
      end
    end

    { total_score: @total_score, question_marks: @question_marks }
  end

  def calculate_coding_test_score
    # Get all final coding test submissions for this test attempt (exclude test runs)
    coding_submissions = @test_attempt.coding_test_submissions.final_submissions.includes(:coding_test)
    
    total_coding_score = 0
    
    coding_submissions.each do |submission|
      if submission.score.present?
        total_coding_score += submission.score
      end
    end
    
    total_coding_score
  end
end

class Api::V1::TestAttemptsController < ApplicationController
  before_action :authorize_guest_token, only: [:show, :dashboard, :update, :start_test]
  before_action :authenticate_user!, only: [:index, :by_test, :show_attempt_details, :test_attempts_list, :destroy]

  def index
    begin
      @test_attempts = TestAttempt
                        .joins(:test)
                        .where(tests: { user_id: current_user.id })
                        .includes(:test)
                        .select('test_attempts.id, test_attempts.test_id, test_attempts.marks, test_attempts.completed_at, tests.title, tests.description, tests.test_type, tests.created_at')

      result = @test_attempts.group_by(&:test_id).map do |test_id, attempts|
        test = attempts.first.test
        {
          test: {
            id: test.id,
            title: test.title,
            description: test.description,
            test_type: test.test_type,
            created_at: test.created_at
          },
          total_attempts: attempts.count,
          average_score: attempts.map(&:marks).compact.sum.to_f / attempts.count,
          last_attempt: attempts.max_by(&:created_at)&.created_at
        }
      end

      render json: result
    rescue => e
      Rails.logger.error "Error fetching test attempts: #{e.message}"
      render json: { error: "Failed to fetch test attempts" }, status: :internal_server_error
    end
  end

  def by_test
    begin
      test = Test.find(params[:id])
      @test_attempts = test.test_attempts.includes(:user).order(created_at: :desc)
      render json: @test_attempts
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Test not found" }, status: :not_found
    rescue => e
      Rails.logger.error "Error fetching test attempts by test: #{e.message}"
      render json: { error: "Failed to fetch test attempts" }, status: :internal_server_error
    end
  end

  def test_attempts_list
    begin
      @test_attempts =  TestAttempt.where(test_id: params[:test_id])
                        .includes(:test)
                        .order(created_at: :desc)
                        .page(params[:page])
                        .per(params[:per_page] || 10)

      render json: @test_attempts, each_serializer: TestAttemptSerializer
    rescue => e
      Rails.logger.error "Error fetching test attempts list: #{e.message}"
      render json: { error: "Failed to fetch test attempts list" }, status: :internal_server_error
    end
  end

  def attempt_details
    begin
      @test_attempt = TestAttempt
                      .includes(test: { sections: [:questions, :coding_tests] })
                      .find_by(guest_token: params[:id])

      if @test_attempt
        test = @test_attempt.test
        total_score = @test_attempt.calculate_total_score

        render json: {
          attempt_id: @test_attempt.id,
          test_creator_id: test.user_id,
          test_title: test.title,
          marks: @test_attempt.marks,
          total_marks: test.total_marks,
          total_score: total_score,
          response_email_sent: @test_attempt.response_email_sent,
          responses: @test_attempt.answers,
          question_wise_marks: @test_attempt.question_wise_marks_obtained,
          coding_test_submissions: @test_attempt.coding_test_submissions.final_submissions.as_json(include: :coding_test),
          coding_test_states: @test_attempt.coding_test_states,
          sections: test.sections.as_json(
            only: [:id, :name, :duration],
            include: {
              questions: {
                only: [:id, :content, :question_type, :options_json, :correct_answer, :option_1, :option_2, :option_3, :option_4]
              },
              coding_tests: {
                only: [:id, :title, :description, :marks, :difficulty, :boilerplate_code],
                include: {
                  test_cases: {
                    only: [:id, :input, :expected_output]
                  }
                }
              }
            }
          )
        }
      else
        render json: { error: 'Test attempt not found or unauthorized' }, status: :not_found
      end
    rescue => e
      Rails.logger.error "Error fetching attempt details: #{e.message}"
      render json: { error: "Failed to fetch attempt details" }, status: :internal_server_error
    end
  end

  def show_attempt_details
    begin
      @test_attempt = TestAttempt
                      .includes(test: { sections: [:questions, :coding_tests] })
                      .find(params[:id])

      if @test_attempt
        test = @test_attempt.test
        total_score = @test_attempt.calculate_total_score

        render json: {
          attempt_id: @test_attempt.id,
          test_creator_id: test.user_id,
          test_title: test.title,
          marks: @test_attempt.marks,
          total_marks: test.total_marks,
          total_score: total_score,
          response_email_sent: @test_attempt.response_email_sent,
          responses: @test_attempt.answers,
          question_wise_marks: @test_attempt.question_wise_marks_obtained,
          coding_test_submissions: @test_attempt.coding_test_submissions.final_submissions.as_json(include: :coding_test),
          coding_test_states: @test_attempt.coding_test_states,
          sections: test.sections.as_json(
            only: [:id, :name, :duration],
            include: {
              questions: {
                only: [:id, :content, :question_type, :options_json, :correct_answer, :option_1, :option_2, :option_3, :option_4]
              },
              coding_tests: {
                only: [:id, :title, :description, :marks, :difficulty, :boilerplate_code],
                include: {
                  test_cases: {
                    only: [:id, :input, :expected_output]
                  }
                }
              }
            }
          )
        }
      else
        render json: { error: 'Test attempt not found' }, status: :not_found
      end
    rescue => e
      Rails.logger.error "Error fetching attempt details: #{e.message}"
      render json: { error: "Failed to fetch attempt details" }, status: :internal_server_error
    end
  end

  def show
    begin
      if @test_attempt.completed_at.present?
        render json: { error: "Test already submitted" }, status: :forbidden
      else
        # Eager load sections and their questions and coding tests
        test = @test_attempt.test
        test = Test.includes(sections: [:questions, :coding_tests]).find(test.id)
        test_with_sections = test.as_json(
          include: {
            sections: {
              include: {
                questions: {
                  # Remove methods: [:figure_url]
                },
                coding_tests: {
                  include: :test_cases
                }
              }
            }
          }
        )

        test_attempt_data = @test_attempt.as_json
        test_attempt_data["test"] = test_with_sections
        test_attempt_data["end_at"] = @test_attempt.end_at.to_i * 1000 if @test_attempt.end_at.present?
        test_attempt_data["webcam_required"] = test.webcam_required

        render json: test_attempt_data
      end
    rescue => e
      Rails.logger.error "Error showing test attempt: #{e.message}"
      render json: { error: "Failed to retrieve test attempt" }, status: :internal_server_error
    end
  end

  def create
    begin
      guest_token_x = SecureRandom.hex(16)
      @test =  Test.find_by_slug(params[:test_id])
      current_ist_time = Time.current.in_time_zone("Asia/Kolkata")

      # Get the user who created the test
      test_creator = @test.user
      @subscription = validate_subscription!(test_creator)
      return if @subscription.nil? # Early return if subscription validation failed

      @test_attempt = find_or_initialize_attempt

      if @test_attempt.persisted?
        if @test_attempt.completed_at.nil?
          return render json: {
            test_attempt_id: @test_attempt.id,
            guest_token: @test_attempt.guest_token,
            message: "Resuming existing test"
          }
        else
          return render json: { error: "You have already submitted this test." }, status: :forbidden
        end
      end

      assign_test_attempt_attributes(guest_token_x, current_ist_time)

      if @test_attempt.save
        @subscription.decrement!(:tests_remaining)
        @subscription.check_and_update_status!
        @test_attempt.generate_and_send_otp

        return render json: {
          test_attempt_id: @test_attempt.id,
          guest_token: @test_attempt.guest_token,
          message: "OTP sent to your email"
        }
      else
        return render json: { errors: @test_attempt.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error creating test attempt: #{e.message}"
      render json: { error: "Failed to create test attempt" }, status: :internal_server_error
    end
  end

  def start_test
    begin
      @test_attempt = TestAttempt.find(params[:id])

      if @test_attempt.started_at.blank? || @test_attempt.end_at.blank?
        now = Time.current.in_time_zone("Asia/Kolkata")
        @test_attempt.started_at = now
        @test_attempt.end_at = now + @test_attempt.test.duration.minutes
        @test_attempt.save!
      end

      render json: {
        started_at: @test_attempt.started_at.to_i * 1000,
        test_attempt_id: @test_attempt.id,
        end_at: @test_attempt.end_at.to_i * 1000
      }
    rescue => e
      Rails.logger.error "Error starting test: #{e.message}"
      render json: { error: "Failed to start test" }, status: :internal_server_error
    end
  end

  def update
    begin
      @test_attempt = TestAttempt.find(params[:id])

      Rails.logger.debug "Starting test attempt update for ID: #{params[:id]}"
      Rails.logger.debug "Submission param: #{params[:submission]}"
      Rails.logger.debug "Answers: #{params[:test_attempt][:answers]}"

      # Validate answers before updating
      Rails.logger.debug "About to validate answers: #{params[:test_attempt][:answers].inspect}"
      unless validate_answers(params[:test_attempt][:answers])
        Rails.logger.debug "Answer validation failed"
        return render json: { error: "Invalid answer format" }, status: :bad_request
      end
      Rails.logger.debug "Answer validation passed"

      Rails.logger.debug "About to update test attempt with params: #{test_attempt_params_update.inspect}"
      if @test_attempt.update(test_attempt_params_update)
        Rails.logger.debug "Test attempt updated successfully, starting scoring service"
        
        TestAttemptScoringService.new(@test_attempt, submission: params[:submission]).call
        Rails.logger.debug "Scoring service completed"
        
        @test_attempt.save!
        Rails.logger.debug "Test attempt saved with marks: #{@test_attempt.marks}"

        notify_user(@test_attempt)
        # notify_admin(@test_attempt)

        render json: { message: "Submitted", score: @test_attempt.marks }
      else
        Rails.logger.debug "Test attempt update failed: #{@test_attempt.errors.full_messages}"
        render json: { errors: @test_attempt.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error updating test attempt: #{e.message}"
      render json: { error: "Failed to update test attempt" }, status: :internal_server_error
    end
  end

  def dashboard
    begin
      if @test_attempt
        total_score = @test_attempt.calculate_total_score
        render json: {
          name: @test_attempt.name,
          marks: @test_attempt.marks,
          score: @test_attempt.score,
          total_score: total_score,
          completed_at: @test_attempt.completed_at
        }
      else
        render json: { error: 'Test attempt not found' }, status: :not_found
      end
    rescue => e
      Rails.logger.error "Error fetching dashboard: #{e.message}"
      render json: { error: "Failed to fetch dashboard" }, status: :internal_server_error
    end
  end

  def destroy
    begin
      @test_attempt = TestAttempt.includes(test: :questions).find(params[:id])
      @test_attempt.destroy
      render json: { message: "Test attempt deleted" }
    rescue => e
      Rails.logger.error "Error deleting test attempt: #{e.message}"
      render json: { error: "Failed to delete test attempt" }, status: :internal_server_error
    end
  end

  def send_otp
    begin
      @test_attempt = TestAttempt.find(params[:id])
      @test_attempt.generate_and_send_otp
      render json: { message: "OTP sent successfully" }
    rescue => e
      Rails.logger.error "Error sending OTP: #{e.message}"
      render json: { error: "Failed to send OTP" }, status: :internal_server_error
    end
  end

  def verify_otp
    begin
      @test_attempt = TestAttempt.find(params[:id])
      if @test_attempt.verify_otp(params[:otp])
        render json: { message: "Email verified successfully" }
      else
        render json: { error: "Invalid or expired OTP" }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error verifying OTP: #{e.message}"
      render json: { error: "Failed to verify OTP" }, status: :internal_server_error
    end
  end

  def coding_test_state
    begin
      @test_attempt = TestAttempt.find(params[:id])
      coding_test_id = params[:coding_test_id]
      
      latest_test_run = @test_attempt.coding_test_submissions.latest_test_run(coding_test_id, @test_attempt.id).first
      final_submission = @test_attempt.coding_test_submissions.final_submission(coding_test_id, @test_attempt.id).first
      
      render json: {
        coding_test_id: coding_test_id,
        latest_test_run: latest_test_run&.as_json(include: :coding_test),
        final_submission: final_submission&.as_json(include: :coding_test),
        has_final_submission: final_submission.present?
      }
    rescue => e
      Rails.logger.error "Error fetching coding test state: #{e.message}"
      render json: { error: "Failed to fetch coding test state" }, status: :internal_server_error
    end
  end

  def send_response_email
    test_attempt = TestAttempt.find_by(id: params[:id])
    TestAttemptMailer.response_sheet_email(test_attempt).deliver_now
    test_attempt.update(response_email_sent: true)
  end

  private

  def authorize_guest_token
    return if action_name == 'test_attempts_list' || action_name == 'attempt_details'
    @test_attempt = TestAttempt.includes(test: :questions).find(params[:id])
    request_token = request.headers['guest_token'] || params[:guest_token]

    if @test_attempt.guest_token.present? &&
       (!request_token.present? || !ActiveSupport::SecurityUtils.secure_compare(@test_attempt.guest_token.to_s, request_token.to_s))
      render json: { error: "Token didn't match" }, status: :forbidden
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Test attempt not found" }, status: :not_found
  end

  def validate_answers(answers)
    Rails.logger.debug "Validating answers: #{answers.inspect}"
    Rails.logger.debug "Answers class: #{answers.class}"
    
    return true if answers.blank?
    
    # Convert ActionController::Parameters to hash if needed
    if answers.is_a?(ActionController::Parameters)
      answers = answers.permit!.to_h
      Rails.logger.debug "Converted to hash: #{answers.inspect}"
    end
    
    # Validate that answers is a hash
    unless answers.is_a?(Hash)
      Rails.logger.debug "Answers is not a hash, returning false"
      return false
    end
    
    # Validate each answer
    answers.each do |question_id, answer|
      Rails.logger.debug "Validating question_id: #{question_id.inspect}, answer: #{answer.inspect}"
      if question_id.blank?
        Rails.logger.debug "Question ID is blank, returning false"
        return false
      end
      # Allow empty strings and nil values for unanswered questions
      # Only reject if the answer is explicitly nil (which shouldn't happen)
    end
    
    Rails.logger.debug "Validation passed"
    true
  end

  def test_attempt_params
    params.require(:test_attempt).permit(
      :score,
      answers_attributes: [:question_id, :answer_text, :selected_option]
    )
  end

  def test_attempt_params_update
    permitted_params = params.require(:test_attempt).permit(answers: {})
    Rails.logger.debug "Permitted params: #{permitted_params.inspect}"
    Rails.logger.debug "Answers from permitted params: #{permitted_params[:answers].inspect}"
    permitted_params
  end

  def respondent_params
    params.require(:respondent).permit(:name, :email, :mobile, :institute)
  end

  def find_or_initialize_attempt
    TestAttempt.find_or_initialize_by(
      test: @test,
      email: params[:respondent][:email]
    )
  end

  def assign_test_attempt_attributes(guest_token, current_ist_time)
    @test_attempt.assign_attributes(
      name: params[:respondent][:name],
      email: params[:respondent][:email],
      mobile: params[:respondent][:mobile],
      institute: params[:respondent][:institute],
      guest_token: guest_token,
      started_at: current_ist_time,
      end_at: current_ist_time + @test.duration.minutes
    )
  end

  def notify_user(test_attempt)
    # Send email notification to user
    # TestAttemptMailer.response_sheet_email(test_attempt).deliver_now
    # test_attempt.update(response_email_sent: true)
  rescue => e
    Rails.logger.error "Error sending notification email: #{e.message}"
  end

  def validate_subscription!(user)
    subscription = user.subscriptions
                       .where(status: 'active')
                       .where("tests_remaining > 0")
                       .first

    raise StandardError.new("The test creator does not have any remaining test attempts. Please ask test creator to subscribe the latest plan.") unless subscription

    subscription
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_entity
    nil
  end
end

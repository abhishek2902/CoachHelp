class Api::V1::CodingTestsController < ApplicationController
  before_action :authenticate_user!, except: [:submit_solution]
  before_action :set_coding_test, only: [:show, :update, :destroy, :submit_solution]
  before_action :validate_submission_params, only: [:submit_solution]

  def show
    begin
      render json: @coding_test, include: :test_cases
    rescue => e
      Rails.logger.error "Error showing coding test: #{e.message}"
      render json: { error: "Failed to retrieve coding test" }, status: :internal_server_error
    end
  end

  def create
    begin
      @coding_test = CodingTest.new(coding_test_params)
      
      if @coding_test.save
        render json: @coding_test, include: :test_cases, status: :created
      else
        render json: { errors: @coding_test.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error creating coding test: #{e.message}"
      render json: { error: "Failed to create coding test" }, status: :internal_server_error
    end
  end

  def update
    begin
      if @coding_test.update(coding_test_params)
        render json: @coding_test, include: :test_cases
      else
        render json: { errors: @coding_test.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error updating coding test: #{e.message}"
      render json: { error: "Failed to update coding test" }, status: :internal_server_error
    end
  end

  def destroy
    begin
      @coding_test.destroy
      render json: { message: "Coding test deleted successfully" }
    rescue => e
      Rails.logger.error "Error deleting coding test: #{e.message}"
      render json: { error: "Failed to delete coding test" }, status: :internal_server_error
    end
  end

  def submissions
    begin
      @submissions = @coding_test.coding_test_submissions.order(created_at: :desc)
      render json: @submissions, each_serializer: CodingTestSubmissionSerializer
    rescue => e
      Rails.logger.error "Error fetching submissions: #{e.message}"
      render json: { error: "Failed to fetch submissions" }, status: :internal_server_error
    end
  end

  def submission_status
    begin
      test_attempt_id = params[:test_attempt_id]
      
      if test_attempt_id.blank?
        return render json: { error: "Test attempt ID is required" }, status: :bad_request
      end

      latest_test_run = @coding_test.coding_test_submissions
        .where(test_attempt_id: test_attempt_id, submission_type: 'test_running')
        .order(created_at: :desc)
        .first

      final_submission = @coding_test.coding_test_submissions
        .where(test_attempt_id: test_attempt_id, submission_type: 'submit')
        .order(created_at: :desc)
        .first

      render json: {
        coding_test_id: @coding_test.id,
        test_attempt_id: test_attempt_id,
        has_final_submission: final_submission.present?,
        latest_test_run: latest_test_run&.as_json(include: :coding_test),
        final_submission: final_submission&.as_json(include: :coding_test)
      }
    rescue => e
      Rails.logger.error "Error fetching submission status: #{e.message}"
      render json: { error: "Failed to fetch submission status" }, status: :internal_server_error
    end
  end

  def submit_solution
    begin
      # Rate limiting check
      if rate_limit_exceeded?
        return render json: { error: "Rate limit exceeded. Please wait before submitting again." }, status: :too_many_requests
      end

      # Check if this is a final submission and if one already exists
      if @submission_type == 'submit' && @test_attempt_id.present?
        existing_final_submission = @coding_test.coding_test_submissions
          .where(test_attempt_id: @test_attempt_id, submission_type: 'submit')
          .first
        
        if existing_final_submission
          return render json: { 
            error: "Final submission already exists for this coding test. Cannot submit again.",
            existing_submission_id: existing_final_submission.id
          }, status: :forbidden
        end
      end

      # Validate solution code
      unless valid_solution_code?
        return render json: { error: "Invalid solution code format" }, status: :bad_request
      end

      # Use the code compiler service to run the code
      compiler_service = CodeCompilerService.new
      result = compiler_service.compile_and_test(@coding_test, @solution_code, @language)
      
      # Save the submission
      submission = @coding_test.coding_test_submissions.build(
        solution_code: @solution_code,
        language: @language,
        submitted_by: @submitted_by,
        score: result[:score] || 0,
        test_results: result[:test_results] || [],
        test_attempt_id: @test_attempt_id,
        submission_type: @submission_type
      )

      if submission.save
        if result[:success]
          render json: result.merge(submission_id: submission.id, submission_type: submission.submission_type)
        else
          render json: { 
            error: result[:error],
            test_results: result[:test_results],
            total_tests: @coding_test.test_cases.count,
            passed_tests: 0,
            score: 0,
            submission_id: submission.id,
            submission_type: submission.submission_type
          }, status: :unprocessable_entity
        end
      else
        render json: { error: "Failed to save submission", errors: submission.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error submitting solution: #{e.message}"
      render json: { error: "Failed to process submission" }, status: :internal_server_error
    end
  end

  private

  def set_coding_test
    @coding_test = CodingTest.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Coding test not found" }, status: :not_found
  end

  def validate_submission_params
    @solution_code = params[:solution_code]
    @language = params[:language] || 'javascript'
    @submitted_by = params[:submitted_by] || 'anonymous'
    @test_attempt_id = params[:test_attempt_id]
    @submission_type = params[:submission_type] || 'test_running'
    
    if @solution_code.blank?
      return render json: { error: "Solution code is required" }, status: :bad_request
    end

    unless valid_language?(@language)
      return render json: { error: "Unsupported programming language" }, status: :bad_request
    end
  end

  def valid_language?(language)
    %w[javascript python ruby java cpp c php go rust swift kotlin scala typescript csharp dart r matlab perl haskell lua bash powershell sql html css json xml yaml markdown].include?(language.downcase)
  end

  def valid_solution_code?
    return false if @solution_code.blank?
    return false if @solution_code.length > 10000 # 10KB limit
    return false if @solution_code.include?('eval(') || @solution_code.include?('exec(') # Security check
    true
  end

  def rate_limit_exceeded?
    # Simple rate limiting - can be enhanced with Redis
    cache_key = "coding_test_submission_#{@submitted_by}_#{@coding_test.id}"
    submission_count = Rails.cache.read(cache_key) || 0
    
    if submission_count >= 10 # Max 10 submissions per minute
      return true
    end
    
    Rails.cache.write(cache_key, submission_count + 1, expires_in: 1.minute)
    false
  end

  def coding_test_params
    params.require(:coding_test).permit(
      :title, :description, :marks, :boilerplate_code, :difficulty, :section_id, :frontend_temp_id,
      test_cases_attributes: [:id, :input, :expected_output, :_destroy]
    )
  end
end 
class Api::V1::FeedbacksController < ApplicationController
  def create
    @test_attempt = TestAttempt.find_by(id: feedback_params[:test_attempt_id])

    unless @test_attempt
      return render json: { error: "Test attempt not found" }, status: :not_found
    end

    @feedback = Feedback.new(feedback_params)

    if @feedback.save
      render json: { message: "Feedback submitted successfully." }, status: :created
    else
      render json: { errors: @feedback.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def feedback_params
    params.require(:feedback).permit(:test_attempt_id, :rating, :comment)
  end
end

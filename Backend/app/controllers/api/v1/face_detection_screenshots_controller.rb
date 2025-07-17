class Api::V1::FaceDetectionScreenshotsController < ApplicationController
  def create
    attempt = TestAttempt.find_by_id(params[:test_attempt_id])
    return render json: { error: "TestAttempt not found" }, status: :not_found unless attempt

    screenshot = FaceDetectionScreenshot.find_or_initialize_by(test_attempt_id: attempt.id)

    screenshot.test_id ||= attempt.test_id
    if params[:tag].present?
      screenshot.images.attach(
        io: params[:screenshot],
        filename: params[:screenshot].original_filename,
        content_type: params[:screenshot].content_type,
        metadata: { tag: params[:tag] }
      )
    else
      screenshot.images.attach(params[:screenshot])
    end
    screenshot.save
    head :no_content
  end
end

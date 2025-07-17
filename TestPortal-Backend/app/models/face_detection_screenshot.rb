class FaceDetectionScreenshot < ApplicationRecord
  has_many_attached :images
  belongs_to :test_attempt
  belongs_to :test
end

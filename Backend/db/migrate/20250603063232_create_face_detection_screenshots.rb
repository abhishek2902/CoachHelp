class CreateFaceDetectionScreenshots < ActiveRecord::Migration[7.1]
  def change
    create_table :face_detection_screenshots do |t|
      t.references :test, foreign_key: true
      t.references :test_attempt, foreign_key: true

      t.timestamps
    end
  end
end

class AddWebcamRequiredToTests < ActiveRecord::Migration[7.1]
  def change
    add_column :tests, :webcam_required, :boolean, default: true
  end
end

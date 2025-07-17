# app/controllers/direct_uploads_controller.rb
class DirectUploadsController < ActiveStorage::DirectUploadsController
  skip_before_action :verify_authenticity_token, raise: false
end

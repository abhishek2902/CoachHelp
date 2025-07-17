module Api
  module V1
    class AttachmentsController < ApplicationController
      before_action :authenticate_user!

      def create
        attachment = Attachment.new
        attachment.file.attach(params[:attachment])
        
        if attachment.save
          render json: {
            location: Rails.application.routes.url_helpers.rails_blob_url(attachment.file, host: request.base_url)
          }, status: :ok
        else
          render json: { error: attachment.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      private

      def attachment_params
        params.require(:attachment).permit(:file)
      end
    end
  end
end

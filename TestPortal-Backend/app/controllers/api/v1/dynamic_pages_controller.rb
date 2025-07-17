
module Api
  module V1
    class DynamicPagesController < ApplicationController
      def show
        @dynamic_page = DynamicPage.active.find_by!(slug: params[:id])
        render json: @dynamic_page
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Page not found' }, status: :not_found
      end
    end 
  end
end
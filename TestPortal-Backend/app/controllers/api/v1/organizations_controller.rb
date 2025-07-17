module Api
  module V1
    class OrganizationsController < ApplicationController
      def index
        @organizations = Organization.all
        render json: @organizations
      end
    end
  end
end

module Admin
  class HelpsController < ApplicationController
    # before_action :authenticate_user!
    before_action :authenticate_admin!, except: [:index, :update]
    before_action :set_help, only: [:show, :update, :destroy]

    def index
      per_page = ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i
      page = params[:page] || 1

      helps = Help.order(:position).page(page).per(per_page)

      render json: {
        helps: helps,
        current_page: helps.current_page,
        total_pages: helps.total_pages,
        total_count: helps.total_count
      }
    end

    def show
      render json: @help
    end

    def create
      @help = Help.new(help_params)
      if @help.save
        render json: @help, status: :created
      else
        render json: { errors: @help.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @help.update(help_params)
        render json: @help
      else
        render json: { errors: @help.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @help.destroy
      head :no_content
    end

    def reorder
      params[:order].each_with_index do |id, idx|
        Help.where(id: id).update_all(position: idx)
      end
      head :ok
    end

    private

    def set_help
      @help = Help.find(params[:id])
    end

    def help_params
      params.require(:help).permit(:title, :description, :video_url, :slug, :position)
    end

    def authorize_admin!
      render json: { error: "Unauthorized" }, status: 401 unless current_user&.admin?
    end

    def authenticate_admin!
      token = request.headers['Authorization']&.split(' ')&.last
      payload = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
      user = User.find(payload['sub'])

      unless user.admin == "true"
        render json: { error: 'Access denied' }, status: :unauthorized
      end
    rescue
      render json: { error: 'Invalid token or user' }, status: :unauthorized
    end
  end
end 
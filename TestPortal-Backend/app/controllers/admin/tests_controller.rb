class Admin::TestsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  def index
    @tests = Test.includes(:user, :questions).page(params[:page]).per(ENV.fetch("CARD_DASHBOARD_PER_PAGE", 6).to_i)

    render json: {
      tests: @tests.as_json(include: [:user, :questions]),
      current_page: @tests.current_page,
      total_pages: @tests.total_pages,
      total_count: @tests.total_count
    }
  end
  
  def show
    if params[:id].blank?
      render json: { error: 'Test not found' }, status: :not_found
      return
    end

    begin
      test = Test.friendly.find(params[:id])
      render json: test, include: [:user, :questions, :sections]
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Test not found' }, status: :not_found
    end
  end
  
  def update
    test = Test.friendly.find(params[:id])
    if test.update(test_params)
      render json: { success: true, test: test }
    else
      render json: { success: false, errors: test.errors.full_messages }, status: 422
    end
  end

  def destroy
    test = Test.friendly.find(params[:id])
    test.destroy
    render json: { success: true }
  end

  private
  
  def test_params
    params.require(:test).permit(:title, :description, :test_type, :duration, :approved, :category)
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

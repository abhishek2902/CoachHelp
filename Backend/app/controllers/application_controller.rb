class ApplicationController < ActionController::API
  def health_check
    render json: { status: 'OK' }, status: :ok
  end

  def authenticate_user!
    unless user_signed_in?
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  
  def authorize_admin!
    render json: { error: 'Unauthorized' }, status: 401 unless current_user&.admin?
  end
end


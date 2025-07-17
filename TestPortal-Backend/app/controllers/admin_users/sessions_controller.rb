class AdminUsers::SessionsController < Devise::SessionsController
  include ActionController::MimeResponds
  include ActionController::Flash

  skip_before_action :require_no_authentication, only: [:create]

  respond_to :html, :json

  def create
    user = AdminUser.find_by(email: params[:admin_user][:email])

    if user&.valid_password?(params[:admin_user][:password])
      sign_in(resource_name, user)
      redirect_to '/admin'
    else
      flash[:alert] = "Invalid email or password"
      redirect_to '/admin_login.html?error=1'
    end
  end

  def destroy
    respond_to do |format|
      format.html do
        sign_out(resource_name)
        redirect_to '/admin_login.html'
      end

      format.json do
        sign_out(resource_name)
        render json: { message: 'Logged out' }, status: :ok
      end
    end
  end
end

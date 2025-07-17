class Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  def create
    email = params[:email] || (params[:password] && params[:password][:email])

    recaptcha_token = params[:recaptcha_token] || (params[:password] && params[:password][:recaptcha_token])

    unless verify_recaptcha(recaptcha_token)
      return render json: { errors: ['reCAPTCHA verification failed'] }, status: :unprocessable_entity
    end

    self.resource = resource_class.send_reset_password_instructions(email: email)

    if successfully_sent?(resource)
      render json: { message: 'Password reset instructions sent.' }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def edit
    redirect_to "#{ENV['FRONTEND_URL']}/reset-password?reset_password_token=#{params[:reset_password_token]}"
  end

  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    if resource.errors.empty?
       UserMailerJob.perform_later("password_confirmation", resource.id)
      render json: { message: 'Password has been reset.' }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def verify_recaptcha(token)
    secret_key = ENV['RECAPTCHA_SECRET_KEY']
    uri = URI("https://www.google.com/recaptcha/api/siteverify")
    res = Net::HTTP.post_form(uri, {
      "secret" => secret_key,
      "response" => token
    })
    json = JSON.parse(res.body)
    json["success"] == true
  end
end

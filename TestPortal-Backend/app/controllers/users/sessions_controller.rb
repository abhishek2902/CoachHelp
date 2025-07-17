class Users::SessionsController < Devise::SessionsController
  before_action :authenticate_for_refresh, only: [:refresh]
  require 'geocoder'
  include RackSessionFix
  respond_to :json

  def create
    user = User.find_by(email: params.dig(:user, :email))

    if user&.valid_password?(params.dig(:user, :password))
      token = generate_jwt(user)
      track_login(user)

      has_active_subscription = user.subscriptions.where("end_date >= ?", Time.current)
                                            .where("tests_remaining > 0")
                                            .exists?

      render json: { token: token, user: user.as_json.merge(subscription: has_active_subscription) }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def refresh
    token = request.headers['Authorization']&.split(' ')&.last

    begin
      payload, = JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256', verify_expiration: false)
      user = User.find(payload['sub'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: 'Unauthorized' }, status: :unauthorized and return
    end

    sign_in(user, store: false)
    new_token = request.env['warden-jwt_auth.token']
    render json: { token: new_token }, status: :ok
  end

  def authenticate_for_refresh
    secret_key = Rails.application.credentials.secret_key_base

    token = request.headers['Authorization']&.split(' ')&.last
    payload, = JWT.decode(token, secret_key, true, algorithm: 'HS256', verify_expiration: false)
    user = User.find(payload['sub'])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  private

  def generate_jwt(user)
    expiration_time = ENV['JWT_EXPIRATION_TIME']&.to_i || 720
    exp_timestamp = expiration_time.minutes.from_now.to_i
    JWT.encode(
      {
        sub: user.id,
        iat: Time.current.to_i,
        exp: exp_timestamp,
        jti: SecureRandom.uuid
      },
      Rails.application.credentials.secret_key_base
    )
  end

  def track_login(user)
    TrackUserLoginJob.perform_later(user.id, request.remote_ip)
  end

  def flash
    {} # or ActionDispatch::Flash::FlashHash.new if needed
  end

  def respond_to_on_destroy
    head :no_content
  end
end

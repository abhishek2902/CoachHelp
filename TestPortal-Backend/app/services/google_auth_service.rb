class GoogleAuthService
  def initialize(params)
    @params = params
    @referred_by_code = params[:referred_by_code]
  end

  def authenticate
    user_info = fetch_user_info
    return { error: "Invalid Google token", status: :unauthorized } unless user_info

    user = find_or_create_user(user_info)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { token: token, user: user, status: :ok }
  rescue GoogleIDToken::ValidationError
    { error: "Invalid Google token", status: :unauthorized }
  rescue => e
    Rails.logger.error("Google Auth Error: #{e.message}")
    { error: "Authentication failed", status: :unauthorized }
  end

  private

  def fetch_user_info
    if @params[:access_token].present?
      fetch_google_userinfo(@params[:access_token])
    elsif @params[:credential].present?
      validate_google_id_token(@params[:credential])
    end
  end

  def fetch_google_userinfo(access_token)
    uri = URI("https://www.googleapis.com/oauth2/v3/userinfo")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    req = Net::HTTP::Get.new(uri.request_uri)
    req["Authorization"] = "Bearer #{access_token}"
    res = http.request(req)
    return nil unless res.code == "200"
    JSON.parse(res.body)
  rescue
    nil
  end

  def validate_google_id_token(id_token)
    validator = GoogleIDToken::Validator.new
    payload = validator.check(id_token, ENV['GOOGLE_CLIENT_ID'])
    {
      "email" => payload["email"],
      "given_name" => payload["given_name"],
      "family_name" => payload["family_name"]
    }
  rescue
    nil
  end

  def find_or_create_user(user_info)
    email = user_info["email"]
    first_name = user_info["given_name"] || user_info["name"] || ""
    last_name = user_info["family_name"] || ""
    user = User.find_or_initialize_by(email: email)

    if user.new_record?
      user.first_name = first_name
      user.last_name = last_name
      user.password = SecureRandom.hex(16)
      user.confirmed_at = Time.current
      user.organization = Organization.find_or_create_by(name: "N/A")
      user.save!  # must save before creating Referral

      if @referred_by_code.present?
        referrer_record = User.find_by(referral_code: @referred_by_code)
        Referral.create!(
          user_id: user.id,
          referred_by_code: @referred_by_code,
          referral_rewarded: false,
          subscription_status: "none"
        )
        UserMailer.referral_success_email(referrer_record, user).deliver_later if referrer_record
      end
      
      # Send admin notification for new user registration
      UserMailer.notify_admin_of_new_user(user).deliver_later
    end
    user
  end
end

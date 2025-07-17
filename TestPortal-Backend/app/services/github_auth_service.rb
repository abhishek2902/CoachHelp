class GithubAuthService
  def initialize(params)
    @params = params
    @referred_by_code = params[:referred_by_code]
  end

  def authenticate
    access_token = fetch_access_token(@params[:code])
    return { error: "Invalid GitHub code", status: :unauthorized } unless access_token

    user_info = github_api_get("https://api.github.com/user", access_token)
    email = fetch_email(access_token, user_info)
    return { error: "Could not retrieve email from GitHub", status: :unprocessable_entity } if email.blank?

    user = find_or_create_user(email, user_info)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { token: token, user: user, status: :ok }
  rescue => e
    Rails.logger.error("GitHub Auth Error: #{e.message}")
    { error: "Authentication failed", status: :unauthorized }
  end

  private

  def fetch_access_token(code)
    client_id = ENV['GITHUB_CLIENT_ID']
    client_secret = ENV['GITHUB_CLIENT_SECRET']
    uri = URI("https://github.com/login/oauth/access_token")
    res = Net::HTTP.post_form(uri, {
      client_id: client_id,
      client_secret: client_secret,
      code: code
    })
    CGI.parse(res.body)["access_token"]&.first
  rescue
    nil
  end

  def github_api_get(url, access_token)
    uri = URI(url)
    req = Net::HTTP::Get.new(uri)
    req['Authorization'] = "token #{access_token}"
    req['User-Agent'] = 'TestPortalApp'
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  rescue
    {}
  end

  def fetch_email(access_token, user_info)
    email_info = github_api_get("https://api.github.com/user/emails", access_token)
    if email_info.is_a?(Array)
      primary_email_obj = email_info.find { |e| e["primary"] && e["verified"] }
      email = primary_email_obj ? primary_email_obj["email"] : nil
      email ||= email_info.find { |e| e["verified"] }&.dig("email")
    else
      email = user_info["email"]
    end
    email
  end

  def find_or_create_user(email, user_info)
    user = User.find_or_initialize_by(email: email)
    if user.new_record?
      user.first_name = user_info["name"] || user_info["login"]
      user.password = SecureRandom.hex(16)
      user.confirmed_at = Time.current
      user.organization = Organization.find_or_create_by(name: "N/A")
      user.save!
      
      # Send admin notification for new user registration
      UserMailer.notify_admin_of_new_user(user).deliver_later
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
    end
    user
  end
end 
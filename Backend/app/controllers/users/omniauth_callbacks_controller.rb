class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :verify_authenticity_token, raise: false, only: :google_oauth2

  def google_oauth2
    @user = User.from_omniauth(request.env['omniauth.auth'])
    if @user.persisted?
      if params[:referral].present?
        referral = User.find_by(referral_code: params[:referral])

        if referral
        # Update the referred user’s referral record (if exists) or create one
         referred_user_referral = @user.referral || @user.build_referral
         referred_user_referral.referred_by_code = params[:referral]
         referred_user_referral.referral_rewarded = false
         referred_user_referral.subscription_status = 'none'
         referred_user_referral.cash_benefit = 0
         referred_user_referral.save!
        end
      end


      token = Warden::JWTAuth::UserEncoder.new.call(@user, :user, nil).first
      redirect_to "#{ENV['FRONTEND_URL']}/login?token=#{token}", allow_other_host: true
    else
      session['devise.google_data'] = request.env['omniauth.auth'].except(:extra)
      redirect_to new_user_registration_url, alert: 'Google authentication failed'
    end
  rescue => e
    Rails.logger.error("Google OAuth error: #{e.message}")
  end

  def failure
    Rails.logger.error("Omniauth failure params: #{request.params.inspect}")
    redirect_to "#{ENV['FRONTEND_URL']}/login", allow_other_host: true
  end
end

# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  include RackSessionFix
  respond_to :json

  def create
    org = Organization.find_or_create_by(name: params[:user][:organization].presence || "N/A")
    params[:user].delete(:organization)
    referred_by_code = params[:user][:referred_by_code]
    build_resource(sign_up_params)
    resource.organization = org if org.present?

    if resource.save
        if referred_by_code.present?
          Referral.create!(
            user: resource,
            # referral_code: SecureRandom.hex(6),
            referred_by_code: referred_by_code,
            referral_rewarded: false,
            subscription_status: "none"
          )
        referrer = User.find_by(referral_code: referred_by_code)
         UserMailer.referral_success_email(referrer, resource).deliver_later if referrer
      end
      
      # Send admin notification for new user registration
      UserMailer.notify_admin_of_new_user(resource).deliver_later
      
      render json: { message: 'Signed up successfully'}, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if params[:user].present?
      current_user.update(account_update_params)
      render json: { message: 'Account updated successfully', user: current_user }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def account_update_params
    params.require(:user).permit(
      :email,
      :first_name,
      :last_name,
      :mobile_number,
      :password,
      :password_confirmation,
      :profile_picture,
      :gst_number,
      :login_email_required,
      :login_notified
    )
  end

  def sign_up_params
    params.require(:user).permit(
      :email, :password, :password_confirmation,
      :first_name, :last_name, :mobile_number, :profile_picture, :country, :login_email_required, :login_notified, :organization_id
    )
  end
end

module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      def update
        if (organization = params[:user].delete(:organization)).present?
          org = Organization.find_or_create_by(name: organization)
          current_user.update(organization_id: org.id)
          params[:user].delete(:organization)
        end

        if params[:user].empty?
          render json: { message: 'No changes submitted', user: current_user }, status: :ok
        elsif current_user.update(account_update_params)
          render json: { message: 'Account updated successfully', user: current_user }, status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def generate_referral_code
        # referral = current_user.referral || current_user.build_referral

        if current_user.referral_code.blank?
          current_user.referral_code = loop do
            code = SecureRandom.hex(6)
            break code unless User.exists?(referral_code: code)
          end
          current_user.save!
        end

        render json: { referral_code: current_user.referral_code }
      end


      def share_referral_invitation
        recipient_email = params[:email]

        if recipient_email.blank?
          render json: { error: 'Recipient email is required' }, status: :unprocessable_entity
          return
        end

        if current_user.email.downcase == recipient_email.downcase
          render json: { error: "You cannot refer yourself." }, status: :unprocessable_entity
          return
        end

        unless recipient_email.match?(URI::MailTo::EMAIL_REGEXP)
          render json: { error: 'Invalid email address' }, status: :unprocessable_entity
          return
        end

        if User.exists?(email: recipient_email.downcase)
          render json: { error: "This user is already registered on the platform." }, status: :unprocessable_entity
          return
        end

        if ReferralEmailLog.exists?(recipient_email: recipient_email.downcase)
          render json: { error: "This user has already been invited by someone ." }, status: :unprocessable_entity
          return
        end

        recent_email = ReferralEmailLog.where(user: current_user, recipient_email: recipient_email)
        .where("sent_at >= ?", 10.minutes.ago)
        .exists?

        if recent_email
          render json: { error: "You can send an invitation to this email again after 10 minutes." }, status: :too_many_requests
          return
        end

        if current_user.referral_code.blank?
          current_user.referral_code = loop do
            code = SecureRandom.hex(6)
            break code unless User.exists?(referral_code: code)
          end
          current_user.save!
        end

        UserMailer.referral_invitation(current_user, recipient_email).deliver_later
        ReferralEmailLog.create!(user: current_user, recipient_email: recipient_email, sent_at: Time.current)

        render json: { message: "Referral invitation sent to #{recipient_email}" }, status: :ok
      end

      private

      def account_update_params
        params.require(:user).permit(
          :email,
          :first_name,
          :last_name,
          :mobile_number,
          :company,
          :password,
          :password_confirmation,
          :profile_picture,
          :gst_number,
          :login_email_required,
          :login_notified,
          :organization_id
          )
      end
    end
  end
end
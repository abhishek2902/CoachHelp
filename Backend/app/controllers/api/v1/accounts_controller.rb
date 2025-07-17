module Api
  module V1
    class AccountsController < ApplicationController
      before_action :authenticate_user!, except: [:confirmation_status, :all_referrals]

      def give
        fetch_org # This will set @organizations
        render json: {
          user: current_user.as_json(
            only: [:first_name, :last_name, :email, :mobile_number, :organization_id, :admin, :country, :gst_number, :login_email_required, :referral_code],
            methods: [:profile_picture_url],
            include: {
              organization: { only: [:id, :name] }
            }
          ),
          organizations: @organizations.as_json(only: [:id, :name])
        }
      end

      def update
        if current_user.update(user_params)
          render json: current_user, status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def confirmation_status
        user = User.find_by(email: params[:email])
        if user
          render json: { confirmed: user.confirmed? }
        else
          render json: { error: "User not found" }, status: :not_found
        end
      end

      def upload_profile_picture
        if params[:profile_picture].present?
          current_user.profile_picture.attach(params[:profile_picture])
          render json: { profile_picture_url: url_for(current_user.profile_picture) }, status: :ok
        else
          render json: { error: 'No profile picture uploaded' }, status: :unprocessable_entity
        end
      end

      def show
        render json: current_user
      end

      def referral
        referral_code = current_user.referral_code

        if referral_code.blank?
          render json: {
            referralCode: nil,
            stats: { totalReferrals: 0, rewardsEarned: 0 },
            history: []
          } and return
        end

        # Find all referrals where my code was used
        referrals = current_user.referrals_sents.includes(:user)
        email_logs = ReferralEmailLog.where(user: current_user).order(sent_at: :desc)
        total_cash_benefit = referrals.sum(:cash_benefit)
        history = []
        referred_users = referrals.includes(:user).map do |ref|
          user = ref.user
           history << {
            email: user&.email,
            name: user&.first_name || "N/A",
            rewarded: ref.referral_rewarded,
            subscription_status: ref.subscription_status || "not_subscribed",
            joined_at: ref.created_at,
            cash_benefit: ref.cash_benefit || 0
          }
        end

        email_logs.each do |log|
          unless history.any? { |h| h[:email] == log.recipient_email }
            history << {
              email: log.recipient_email,
              name: "N/A",
              rewarded: false,
              subscription_status: "not_joined",
              joined_at: log.sent_at,
              cash_benefit: 0
            }
          end
        end

        render json: {
          referralCode: referral_code,
          stats: {
            totalReferrals: history.count,
            rewardsEarned: total_cash_benefit
          },
          history: history
        }
      end

      def all_referrals
        referrals = Referral.includes(:user, :referrer_user).where.not(referred_by_code: nil)

        result = referrals.map do |ref|
          referred_user = ref.user
          referrer = ref.referrer_user

          {
            referred_user_name: referred_user&.first_name || "N/A",
            referred_user_email: referred_user&.email,
            referred_by: referrer&.first_name || "N/A",
            referred_by_email: referrer&.email || "N/A",
            rewarded: ref.referral_rewarded,
            subscription_status: ref.subscription_status,
            joined_at: ref.created_at,
            cash_benefit: ref.cash_benefit || 0
          }
        end

        render json: {
          total_referrals: referrals.count,
          data: result
        }
      end

      private

      def user_params
        params.require(:user).permit(:email, :first_name, :last_name, :mobile_number, :company, :current_password, :password, :password_confirmation, :country, :gst_number, :login_email_required, :referral_code)
      end

      def account_params
        params.require(:user).permit(:first_name, :last_name, :email, :mobile_number, :company)
      end

      def fetch_org
        @organizations = Organization.all
      end
    end
  end
end

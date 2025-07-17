module Api
  module V1
    class AuthController < ApplicationController

      require 'net/http'
      require 'json'
      require 'cgi'

      def google
        result = GoogleAuthService.new(params).authenticate
        if result[:error]
          render json: { error: result[:error] }, status: result[:status]
        else
          user = result[:user]

          has_subscription = user.subscriptions
            .where("end_date >= ?", Time.current)
            .where("tests_remaining > 0")
            .exists?
          render json: {
            token: result[:token],
            user: user.as_json.merge(subscription: has_subscription)
          }, status: result[:status]
        end
      end

      def github
        result = GithubAuthService.new(params).authenticate
        if result[:error]
          render json: { error: result[:error] }, status: result[:status]
        else
          user = result[:user]
          has_subscription = user.subscriptions
            .where("end_date >= ?", Time.current)
            .where("tests_remaining > 0")
            .exists?
          render json: {
            token: result[:token],
            user: user.as_json.merge(subscription: has_subscription)
          }, status: result[:status]
        end
      end

      private

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

      def find_or_create_user_from_google(user_info)
        email = user_info["email"]
        first_name = user_info["given_name"] || user_info["name"] || ""
        last_name = user_info["family_name"] || ""
        user = User.find_or_initialize_by(email: email)
        if user.new_record?
          user.first_name = first_name
          user.last_name = last_name
          user.password = SecureRandom.hex(16)
          user.confirmed_at = Time.current
          user.save!
          
          # Send admin notification for new user registration
          UserMailer.notify_admin_of_new_user(user).deliver_later
        end
        user
      end
    end
  end
end 
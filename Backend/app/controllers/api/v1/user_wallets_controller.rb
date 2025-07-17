module Api
  module V1
    class UserWalletsController < ApplicationController
      before_action :authenticate_user!

      def index
        wallets = UserWallet.includes(:user).all.order(created_at: :desc)
        render json: wallets.as_json(include: { user: { only: [:id, :email] } })
      end

      def show
        wallet = UserWallet.includes(:user).find(params[:id])
        render json: wallet.as_json(include: { user: { only: [:id, :email] } })
      end
    end
  end
end

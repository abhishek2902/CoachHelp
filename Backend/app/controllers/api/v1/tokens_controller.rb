module Api
  module V1
    class TokensController < ApplicationController
      before_action :authenticate_user!

      # POST /api/v1/tokens/purchase
      def purchase
        tokens = params[:tokens].to_i
        if tokens <= 0
          render json: { error: "Invalid token amount." }, status: :unprocessable_entity
          return
        end
        # Here you would handle payment verification if needed
        wallet = UserWallet.find_or_create_by(user: current_user)
        wallet.token_balance ||= 0
        wallet.token_balance += tokens
        wallet.save!
        TokenTransaction.create!(user: current_user, amount: tokens, source: 'purchase', meta: { note: 'Token purchase' })
        render json: { wallet_balance: wallet.token_balance }
      end
    end
  end
end

module Api
  module V1
    class TokenTransactionsController < ApplicationController
      before_action :authenticate_user!

      def index
        # Removed strict format check
        # Parse dates in the current timezone
        start_date = if params[:start_date].present?
          Time.zone.parse(params[:start_date]).beginning_of_day
        else
          Time.zone.at(0)
        end

        end_date = if params[:end_date].present?
          Time.zone.parse(params[:end_date]).end_of_day
        else
          Time.zone.now
        end

        # Get transactions with date filtering
        transactions = TokenTransaction.includes(:user, :conversation)
          .where(user: current_user)
          .where(created_at: start_date..end_date)
          .order(created_at: :desc)

        # Get global wallet balance
        wallet = UserWallet.find_or_create_by(user: current_user)
        wallet.token_balance ||= 0

        render json: {
          transactions: transactions.as_json(include: { 
            user: { only: [:id, :email] },
            conversation: { only: [:id] }
          }),
          wallet_balance: wallet.token_balance
        }
      end

      def show
        transaction = TokenTransaction.includes(:user, :conversation).find(params[:id])
        render json: transaction.as_json(include: { 
          user: { only: [:id, :email] }, 
          conversation: { only: [:id] } 
        })
      end
    end
  end
end

module Api
  module V1
    class ConversationsController < ApplicationController
      before_action :authenticate_user!

      def index
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

        # Get conversations with date filtering
        if current_user.respond_to?(:admin?) && current_user.admin?
          conversations = Conversation.includes(:user, :test)
            .where(created_at: start_date..end_date)
            .order(created_at: :desc)
        else
          conversations = Conversation.includes(:user, :test)
            .where(user: current_user)
            .where(created_at: start_date..end_date)
            .order(created_at: :desc)
        end

        render json: conversations.as_json(include: { user: { only: [:id, :email] }, test: { only: [:id, :title] } })
      end

      def show
        conversation = Conversation.includes(:chat_messages, :token_transactions, :user, :test).find(params[:id])
        render json: conversation.as_json(
          include: {
            user: { only: [:id, :email] },
            test: { only: [:id, :title] },
            chat_messages: { only: [:id, :role, :content, :token_count, :created_at] },
            token_transactions: { only: [:id, :amount, :source, :meta, :created_at] }
          }
        )
      end

      def create
        conversation = Conversation.create!(user: current_user)
        render json: { conversation_id: conversation.id }
      end
    end
  end
end

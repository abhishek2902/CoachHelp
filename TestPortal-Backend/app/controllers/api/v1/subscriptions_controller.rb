class Api::V1::SubscriptionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_subscription, only: [:show, :update, :destroy]

  def index
    subscriptions = current_user.subscriptions
    render json: subscriptions
  end

  def show
    render json: @subscription
  end

  def create
    subscription = current_user.subscriptions.build(subscription_params)

    if subscription.save
      render json: subscription, status: :created
    else
      render json: { errors: subscription.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @subscription.update(subscription_params)
      render json: @subscription
    else
      render json: { errors: @subscription.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @subscription.destroy
    head :no_content
  end

  private

  def set_subscription
    @subscription = Subscription.find(params[:id])
  end

  def subscription_params
    params.require(:subscription).permit(:plan_id, :start_date, :end_date, :status, :custom_options)
  end
end


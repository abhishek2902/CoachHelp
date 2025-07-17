class Api::V1::RazorpayController < ApplicationController
  before_action :authenticate_user!, except: :webhook

  def create_order
    service = RazorpayService.new(current_user, params)
    result = service.create_order

    if result[:error]
      Rails.logger.error "Razorpay Order Creation Failed: #{result[:error]}"
      render json: { error: result[:error] }, status: :unprocessable_entity
    else
      render json: result
    end
  end

  def verify_payment
    service = RazorpayService.new(current_user, params)
    result = service.verify_payment

    if result[:success]
      render json: { success: true, message: result[:message] }
    else
      render json: { success: false, errors: result[:errors] }, status: :unprocessable_entity
    end
  end

  def webhook
    payload = request.body.read
    received_signature = request.env['HTTP_X_RAZORPAY_SIGNATURE']

    service = RazorpayService.new(nil, {})
    result = service.process_webhook(payload, received_signature)

    head result[:status]
  end
end

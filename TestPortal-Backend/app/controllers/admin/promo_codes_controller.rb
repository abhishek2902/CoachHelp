# app/controllers/admin/promo_codes_controller.rb
module Admin
  class PromoCodesController < ApplicationController
    before_action :authenticate_user!
    before_action :authorize_admin!
    
    def index
      @promo_codes = PromoCode.page(params[:page]).per(ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i)
      render json: {
        promo_codes: @promo_codes,
        current_page: @promo_codes.current_page,
        total_pages: @promo_codes.total_pages,
        total_count: @promo_codes.total_count
      }
    end
    
    def show
      @promo_code = PromoCode.find_by(code: params[:code]) if params[:code].present?
      @plan = Plan.find_by(id: params[:plan_id]) if params[:plan_id].present?
      
      if @promo_code.nil?
        render json: { error: 'Invalid or expired promo code' }, status: :unprocessable_entity
        return
      end
      
      if @promo_code.usable? && !@promo_code.expired?
        discounted_amount = nil
        
        if @plan.present? && @promo_code.discount.present?
          discounted_amount = @plan.price.to_f - (@plan.price.to_f * @promo_code.discount.to_f / 100)
        end
        
        render json: {
          promo_code: @promo_code,
          plan: @plan&.id,
          discounted_amount: discounted_amount
        }
      else
        render json: { error: "Promo code expired or not valid! contact with #{ENV['SUPPORT_EMAIL'] || 'support@talenttest.co'} for discount!!" }, status: :unprocessable_entity
      end
    end
    
    def create
      @promo_code = PromoCode.new(promo_code_params)
      if @promo_code.save
        render json: @promo_code, status: :created
      else
        render json: { errors: @promo_code.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def update
      @promo_code = PromoCode.find(params[:id])
      if @promo_code.update(promo_code_params)
        render json: @promo_code
      else
        render json: { errors: @promo_code.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def destroy
      @promo_code = PromoCode.find(params[:id])
      @promo_code.destroy
      head :no_content
    end
    
    private
    
    def promo_code_params
      params.require(:promo_code).permit(:code, :discount, :expires_at, :active, :usage_limit)
    end
  end
end

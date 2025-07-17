class Api::V1::FaqsController < ApplicationController
  before_action :set_faq, only: [:show, :update, :destroy]
  before_action :authenticate_user!, except: [:index]
  before_action :authorize_admin!, except: [:index]

  # GET /api/v1/faqs
  def index
    faqs = Faq.order(created_at: :desc).page(params[:page]).per(ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i)

    render json: {
      faqs: faqs,
      meta: {
        current_page: faqs.current_page,
        next_page: faqs.next_page,
        prev_page: faqs.prev_page,
        total_pages: faqs.total_pages,
        total_count: faqs.total_count
      }
    }, status: :ok
  end

  # GET /api/v1/faqs/:id
  def show
    render json: @faq
  end

  # POST /api/v1/faqs
  def create
    faq = Faq.new(faq_params)
    if faq.save
      render json: faq, status: :created
    else
      render json: { errors: faq.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT /api/v1/faqs/:id
  def update
    if @faq.update(faq_params)
      render json: @faq
    else
      render json: { errors: @faq.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/faqs/:id
  def destroy
    @faq.destroy
    head :no_content
  end

  private

  def set_faq
    @faq = Faq.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "FAQ not found" }, status: :not_found
  end

  def faq_params
    params.require(:faq).permit(:question, :answer, :tags)
  end

  def authorize_admin!
    render json: { error: "Unauthorized" }, status: 401 unless current_user&.admin?
  end

  def authenticate_admin!
      token = request.headers['Authorization']&.split(' ')&.last
      payload = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
      user = User.find(payload['sub'])

      unless user.admin == "true"
        render json: { error: 'Access denied' }, status: :unauthorized
      end
  rescue
      render json: { error: 'Invalid token or user' }, status: :unauthorized
  end
end

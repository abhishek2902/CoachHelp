class Admin::ReviewsController < ApplicationController
  before_action :set_review, only: [:show, :update, :destroy]
  before_action :authenticate_user!, except: [:index]
  before_action :authorize_admin!, except: [:index]

  def index
    @reviews = Review.includes(:user).page(params[:page]).per(ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i)

    render json: {
      reviews: ActiveModelSerializers::SerializableResource.new(@reviews, each_serializer: ReviewSerializer),
      meta: {
        current_page: @reviews.current_page,
        next_page: @reviews.next_page,
        prev_page: @reviews.prev_page,
        total_pages: @reviews.total_pages,
        total_count: @reviews.total_count
      }
    }
  end

  def show
    render json: @review, serializer: ReviewSerializer
  end

  def create
    @review = Review.new(review_params)
    if @review.save
      render json: @review, status: :created
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def update
    if @review.update(review_params)
      render json: @review
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @review.destroy
    head :no_content
  end

  private

  def set_review
    @review = Review.find_by!(slug: params[:slug])
  end

  def review_params
    params.require(:review).permit(:user_id, :title, :rating, :comment, :show_in_public, :slug)
  end
end 
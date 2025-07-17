class Admin::DynamicPagesController < ApplicationController
  before_action :set_dynamic_page, only: [:show, :update, :destroy]
  before_action :authenticate_user!
  before_action :authorize_admin!

  def index
    dynamic_pages = DynamicPage.order(created_at: :desc)
                               .page(params[:page])
                               .per(ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i)
    render json: {
      dynamic_pages: dynamic_pages,
      current_page: dynamic_pages.current_page,
      total_pages: dynamic_pages.total_pages,
      total_count: dynamic_pages.total_count
    }
  end

  def show
    render json: @dynamic_page
  end

  def create
    @dynamic_page = DynamicPage.new(dynamic_page_params)
    if @dynamic_page.save
      render json: @dynamic_page, status: :created
    else
      render json: @dynamic_page.errors, status: :unprocessable_entity
    end
  end

  def update
    if @dynamic_page.update(dynamic_page_params)
      render json: @dynamic_page
    else
      render json: @dynamic_page.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @dynamic_page.destroy
    head :no_content
  end

  private

  def set_dynamic_page
    @dynamic_page = DynamicPage.find_by!(slug: params[:slug])
  end

  def dynamic_page_params
    params.require(:dynamic_page).permit(
      :title, :slug, :content, :meta_description, :og_title, 
      :og_description, :og_image, :canonical_url, :price, 
      :currency, :active, schema_data: {}
    )
  end
end 
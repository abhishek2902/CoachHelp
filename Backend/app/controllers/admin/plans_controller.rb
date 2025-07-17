class Admin::PlansController < ApplicationController
  before_action :authenticate_user!, except: [:index]
  before_action :authorize_admin!, except: [:index]
  before_action :set_plan, only: [:show, :update, :destroy]

  # GET /admin/plans
  def index
    plans = Plan.page(params[:page]).per(ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i)

    render json: {
      plans: plans.as_json,
      current_page: plans.current_page,
      total_pages: plans.total_pages,
      total_count: plans.total_count
    }
  end

  # GET /admin/plans/:id
  def show
    render json: @plan
  end

  # POST /admin/plans
  def create
    plan = Plan.new(plan_params)
    if plan.save
      render json: { success: true, plan: plan }, status: :created
    else
      render json: { success: false, errors: plan.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PUT/PATCH /admin/plans/:id
  def update
    if @plan.update(plan_params)
      render json: { success: true, plan: @plan }
    else
      render json: { success: false, errors: @plan.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /admin/plans/:id
  def destroy
    @plan.destroy
    render json: { success: true, message: 'Plan deleted successfully' }
  end

  private

  def set_plan
    @plan = Plan.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Plan not found' }, status: :not_found
  end

  def plan_params
    params.require(:plan).permit(:name, :price, :interval, :description, :features, :active, :tests_allowed, :is_one_time_use)
  end
end

# app/controllers/api/v1/categories_controller.rb
class Api::V1::CategoriesController < ApplicationController
  before_action :set_domain, only: [:index, :create, :final_categories]
  before_action :set_category, only: [:show, :update, :destroy]

  def index
    # Return only root categories (no parent_id) with their nested children
    render json: @domain.categories.where(parent_id: nil).includes(:children)
  end

  def show
    render json: @category, include: { children: { include: :children }, master_questions: {} }
  end

  def create
    category = @domain.categories.new(category_params)
    if category.save
      render json: category, status: :created
    else
      render json: { errors: category.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: @category
    else
      render json: { errors: @category.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @category.destroy
    head :no_content
  end

  # Find all final categories (leaf categories with questions) for a test domain
  def final_categories
    final_categories = @domain.categories
                              .includes(:master_questions, :parent)
                              .where(id: @domain.categories.leaf_categories.pluck(:id))
                              .where.not(master_questions: { id: nil })
                              .distinct

    render json: final_categories.as_json(include: {
      master_questions: {},
      parent: { only: [:id, :name, :slug] }
    })
  end

  def clone
    begin
      service = MasterQuestionCloneService.new(params[:id], current_user)
      test = service.clone_to_test
      Notification.create!(
        user: current_user,
        message: "Your test '#{test.title}' was cloned successfully.",
        notifiable: test
      )
      render json: { message: "Test cloned successfully", id: test.id }, status: :created
    rescue => e
      Rails.logger.error "Error cloning master questions: #{e.message}"
      render json: { error: "Failed to clone test: #{e.message}" }, status: :unprocessable_entity
    end
  end

  private
  def set_domain
    @domain = TestDomain.friendly.find(params[:test_domain_id])
  end
  def set_category
    @category = Category.friendly.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Category not found" }, status: :not_found
  end

  def category_params
    params.require(:category).permit(:name, :parent_id)
  end
end

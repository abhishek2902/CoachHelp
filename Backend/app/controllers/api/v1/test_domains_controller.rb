# app/controllers/api/v1/test_domains_controller.rb
class Api::V1::TestDomainsController < ApplicationController
  before_action :set_domain, only: [:show, :update, :destroy]

  def index
    test_domains = TestDomain.preload(
      categories: {
        children: {
          children: :children  # This gives you 3-level nesting
        }
      }
    ).all
    render json: test_domains.as_json(include: {
      categories: {
        include: {
          children: {
            include: :children # this gives you 2-level nesting (child and grandchild)
          }
        }
      }
    })
  end

  def show
    @domain = TestDomain.preload(
      categories: {
        children: {
          children: :children  # This gives you 3-level nesting
        }
      }
    ).friendly.find(params[:id])
    render json: @domain, include: {
      categories: {
        include: {
          children: {
            include: :children
          }
        }
      }
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "TestDomain not found" }, status: :not_found
  end

  def create
    domain = TestDomain.new(domain_params)
    if domain.save
      render json: domain, status: :created
    else
      render json: { errors: domain.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @domain.update(domain_params)
      render json: @domain
    else
      render json: { errors: @domain.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @domain.destroy
    head :no_content
  end

  private

  def set_domain
    @domain = TestDomain.friendly.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "TestDomain not found" }, status: :not_found
  end

  def domain_params
    params.require(:test_domain).permit(:name)
  end
end
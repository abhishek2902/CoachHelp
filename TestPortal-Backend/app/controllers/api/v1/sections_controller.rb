class Api::V1::SectionsController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/sections
  def index
    sections = Section.order(:name)
    render json: sections
  end

  # POST /api/v1/sections
  def create
    section = Section.new(section_params)
    if section.save
      render json: section, status: :created
    else
      render json: { errors: section.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def section_params
    params.require(:section).permit(:name)
  end
end

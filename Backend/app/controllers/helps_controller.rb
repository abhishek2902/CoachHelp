class HelpsController < ApplicationController
  def index
    helps = Help.order(:position).select(:id, :title, :description, :video_url, :slug, :position)
    render json: { helps: helps }
  end

  def show
    help = Help.select(:id, :title, :description, :video_url, :slug, :position).find_by(id: params[:id])
    if help
      render json: help
    else
      render json: { error: 'Help not found' }, status: :not_found
    end
  end
end 
class Admin::OrganizationsController < ApplicationController
before_action :authenticate_user!, except: [:index]
  before_action :authorize_admin!, except: [:index]

  def index
    organizations = Organization.page(params[:page]).per(ENV.fetch("CARD_DASHBOARD_PER_PAGE", 6).to_i)

    render json: {
      organizations: ActiveModelSerializers::SerializableResource.new(organizations, each_serializer: OrganizationSerializer),
      meta: {
        current_page: organizations.current_page,
        next_page: organizations.next_page,
        prev_page: organizations.prev_page,
        total_pages: organizations.total_pages,
        total_count: organizations.total_count
      }
    }
  end

  def create
    org = Organization.new(org_params)
    if org.save
      render json: org, serializer: OrganizationSerializer, status: :created
    else
      render json: org.errors, status: :unprocessable_entity
    end
  end

  def update
    org = Organization.find(params[:id])
    if org.update(org_params)
      render json: org, serializer: OrganizationSerializer
    else
      render json: org.errors, status: :unprocessable_entity
    end
  end

  def destroy
    org = Organization.find(params[:id])
    org.destroy
    render json: { message: 'Deleted' }
  end

  def upload_image
    org = Organization.find(params[:id])
    if params[:image].present?
      org.image.attach(params[:image])
      render json: { image_url: url_for(org.image) }
    else
      render json: { error: 'No image uploaded' }, status: :unprocessable_entity
    end
  end

  private

  def org_params
    params.require(:organization).permit(:name, :show_in_public, :description)
  end
end 
class OrganizationSerializer < ActiveModel::Serializer
  attributes :id, :name, :show_in_public, :description, :image_url

  def image_url
    object.image.attached? ? Rails.application.routes.url_helpers.url_for(object.image) : nil
  end
end 
class ReviewSerializer < ActiveModel::Serializer
  attributes :id, :title, :rating, :comment, :show_in_public, :slug, :created_at, :updated_at
  belongs_to :user, serializer: UserSerializer
end 
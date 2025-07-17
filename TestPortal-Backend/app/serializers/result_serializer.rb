class ResultSerializer < ActiveModel::Serializer
  attributes :id, :score, :created_at, :updated_at

  belongs_to :test, only: [:id, :title, :test_type]  
  belongs_to :user, only: [:id, :email]  
end

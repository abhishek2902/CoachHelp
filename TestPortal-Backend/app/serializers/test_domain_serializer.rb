class TestDomainSerializer < ActiveModel::Serializer
  attributes :id, :name, :slug
  has_many :categories
end

class CategorySerializer < ActiveModel::Serializer
  attributes :id, :name, :slug, :parent_id
  belongs_to :test_domain
  has_many :master_questions

  attribute :children do
    object.children.map { |child| CategorySerializer.new(child, scope: scope, root: false) }
  end
end

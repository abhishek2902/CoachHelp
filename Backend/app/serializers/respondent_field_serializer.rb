class RespondentFieldSerializer < ActiveModel::Serializer
  attributes :id, :label, :field_type, :created_at, :updated_at
end

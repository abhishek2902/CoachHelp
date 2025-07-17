class TestCaseSerializer < ActiveModel::Serializer
  attributes :id, :input, :expected_output
end 
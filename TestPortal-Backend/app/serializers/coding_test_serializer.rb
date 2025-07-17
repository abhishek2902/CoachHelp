class CodingTestSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :marks, :boilerplate_code, :difficulty, :frontend_temp_id

  has_many :test_cases, serializer: TestCaseSerializer

  def difficulty
    object.difficulty
  end
end 
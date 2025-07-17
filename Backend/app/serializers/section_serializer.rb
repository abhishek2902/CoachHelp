class SectionSerializer < ActiveModel::Serializer
  attributes :id, :name, :questions, :coding_tests, :duration, :frontend_temp_id, :is_coding_test

  def questions
    object.questions.map do |q|
      QuestionSerializer.new(q, scope: scope, root: false).as_json
    end
  end

  def coding_tests
    object.coding_tests.map do |ct|
      CodingTestSerializer.new(ct, scope: scope, root: false).as_json
    end
  end
end
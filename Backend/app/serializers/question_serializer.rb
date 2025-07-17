class QuestionSerializer < ActiveModel::Serializer
  attributes :id,
              :test_id,
              :content, 
              :marks, 
              :question_type, 
              :correct_answer, 
              :tags, 
              :option_1, 
              :option_2, 
              :option_3, 
              :option_4,
              :created_at,
              :updated_at,
              :section_id,
              :frontend_temp_id
  # has_one_attached :figure

  # Additional methods to update value
  def created_at
    object.created_at.strftime("%Y-%m-%d %H:%M:%S")
  end

  def updated_at
    object.updated_at.strftime("%Y-%m-%d %H:%M:%S")
  end
  
end

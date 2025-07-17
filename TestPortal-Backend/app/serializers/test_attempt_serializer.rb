# app/serializers/test_attempt_serializer.rb
class TestAttemptSerializer < ActiveModel::Serializer
  attributes :id, :test_id, :started_at, :completed_at, :answers, :marks, :name, :email, :mobile, :institute, :start_at, :end_at, :guest_token

  belongs_to :test, serializer: TestSerializer

  def end_at
    object.end_at.to_i * 1000 if object.end_at.present?
  end

end

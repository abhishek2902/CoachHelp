class TestSerializer < ActiveModel::Serializer
  attributes :id, :title, :test_type, :description, :duration, :total_marks,
             :average_score, :completed_test, :avg_completed_time,
             :passed, :failed, :created_at, :status,  :test_code, :user_id,
             :slug, :link_expires_date, :access_start_time, :access_end_time

  belongs_to :user
  has_many :sections, serializer: SectionSerializer

  # Additional methods to provide defaults if values are nil
  def average_score
    object.average_score || 0
  end

  def completed_tests
    object.completed_tests || 0
  end

  def avg_completed_time
    object.avg_completed_time || 0
  end

  def passed
    object.passed || 0
  end

  def failed
    object.failed || 0
  end

  def description
    object.description || ""
  end

  def duration
    object.duration || 0
  end

  def total_marks
    (object.total_marks || 0).round(2)
  end

  def created_at
    object.created_at.strftime("%Y-%m-%d")
  end

  def user_id
    object.user_id
  end

end

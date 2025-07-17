class CodingTestSubmissionSerializer < ActiveModel::Serializer
  attributes :id, :solution_code, :language, :score, :test_results, :submitted_by, :created_at, :updated_at, :submission_type
  belongs_to :coding_test
  belongs_to :test_attempt, optional: true

  def test_results
    object.test_results || []
  end

  def passed_tests_count
    return 0 unless object.test_results.present?
    object.test_results.count { |result| result['passed'] || result[:passed] }
  end

  def total_tests_count
    return 0 unless object.test_results.present?
    object.test_results.count
  end

  def success_rate
    return 0 if total_tests_count == 0
    (passed_tests_count.to_f / total_tests_count * 100).round(2)
  end

  def is_final_submission
    object.submit?
  end

  def is_test_run
    object.test_running?
  end

  def created_at
    object.created_at.strftime("%Y-%m-%d %H:%M:%S")
  end
end 
module Api
  module V1
    class AnalyticsController < ApplicationController
    
    def status
      total_users = User.count
      total_tests = Test.count
      total_questions = Question.count

      # Customize "active users" logic — here assuming active within last 7 days
      active_users = User.where("updated_at >= ?", 7.days.ago).count

      user_growth_data = User.group_by_day(:created_at, last: 7).count
      test_distribution = Test.group(:test_type).count

      recent_activities = User.order(updated_at: :desc).limit(5).map do |user|
        {
          name: user.first_name || user.email,
          action: "Updated profile or test",
          date: user.updated_at.strftime("%b %d, %Y")
        }
      end

      render json: {
        status: [
          { title: "Total Users", value: total_users, icon: "Users" },
          { title: "Total Tests", value: total_tests, icon: "ListChecks" },
          { title: "Total Questions", value: total_questions, icon: "FileText" },
          { title: "Active Users", value: active_users, icon: "Activity" }
        ],
        activities: recent_activities,
        user_growth: user_growth_data,
        test_distribution: test_distribution
      }
    end

    def my_status
      # Get tests created by current_user
      tests = Test.where(user_id: current_user.id)
      test_ids = tests.pluck(:id)

      total_tests = tests.count
      total_questions = Question.where(test_id: test_ids).count
      total_attempts = TestAttempt.where(test_id: test_ids).count

      last_7_days_attempts = TestAttempt.where(test_id: test_ids)
      .where("created_at >= ?", 7.days.ago)
      .count

      test_distribution = tests.group(:status).count

      attempt_growth = TestAttempt.where(test_id: test_ids)
                              .group_by_day(:created_at, last: 7)
                              .count

      recent_attempts = TestAttempt.where(test_id: test_ids)
      .order(created_at: :desc)
      .limit(50)
      .map do |attempt|
        {
          name: attempt.name || "Unknown",
          email: attempt.email,
          test_title: Test.find(attempt.test_id).title,
          date: attempt.created_at.strftime("%b %d, %Y"),
          score: attempt.score || attempt.marks
        }
      end

      render json: {
        status: [
          { title: "My Tests", value: total_tests, icon: "ListChecks" },
          { title: "Total Questions", value: total_questions, icon: "FileText" },
          { title: "Total Attempts", value: total_attempts, icon: "Users" },
          { title: "Recent 7d Attempts", value: last_7_days_attempts, icon: "Activity" }
        ],
        test_distribution: test_distribution,
        user_growth: attempt_growth,
        recent_attempts: recent_attempts
      }
    end
  end
end
end
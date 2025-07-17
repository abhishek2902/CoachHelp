module Admin
  class AnalyticsController < ApplicationController
    before_action :authenticate_user!
    before_action :authorize_admin!, except: [:my_status]

    def status
      total_users = User.count
      total_tests = Test.count
      total_questions = Question.count

      # Customize "active users" logic — here assuming active within last 7 days
      active_users = User.where("updated_at >= ?", 7.days.ago).count

      user_growth_data = User.group_by_day(:created_at, last: 7).count
      test_distribution = Test.group(:test_type).count

      page = params[:page].to_i
      per_page = ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i

      recent_users = User.order(updated_at: :desc).offset((page - 1) * per_page).limit(per_page)
      total_recent_users = User.count

      recent_activities = recent_users.map do |user|
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
        pagination: {
          current_page: page,
          per_page: per_page,
          total_activities: total_recent_users,
          total_pages: (total_recent_users / per_page.to_f).ceil
        },
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

      test_distribution = tests.group(:test_type).count

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
        recent_attempts: recent_attempts
      }
    end

    def trigger_daily_report
      begin
        DailyUserReportJob.perform_later
        render json: { 
          success: true, 
          message: "Daily user report job has been queued and will be sent shortly." 
        }
      rescue => e
        render json: { 
          success: false, 
          error: e.message 
        }, status: :internal_server_error
      end
    end
  end
end

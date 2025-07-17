# app/controllers/api/v1/ai_mock_tests_controller.rb
class Api::V1::AiMockTestsController < ApplicationController
  before_action :authenticate_user!

  # POST /api/v1/ai_mock_tests/generate_all
  def generate_all
    begin
      # Check if user has sufficient permissions or tokens
      unless can_generate_mock_tests?
        render json: { error: "Insufficient permissions or tokens to generate mock tests" }, status: :forbidden
        return
      end

      # Initialize the service
      service = AiMockTestGeneratorService.new(current_user)
      
      # Generate mock tests for all leaf categories
      results = service.generate_all_mock_tests
      
      render json: {
        message: "AI Mock Test Generation completed",
        results: results,
        summary: {
          total_processed: results[:success] + results[:failed] + results[:skipped],
          success_count: results[:success],
          failed_count: results[:failed],
          skipped_count: results[:skipped]
        }
      }, status: :ok
      
    rescue => e
      Rails.logger.error "Error in AI mock test generation: #{e.message}"
      render json: { error: "Failed to generate mock tests: #{e.message}" }, status: :internal_server_error
    end
  end

  # POST /api/v1/ai_mock_tests/generate_category
  def generate_category
    begin
      category = Category.find(params[:category_id])
      question_count = params[:question_count]&.to_i || 10
      
      # Check if user has sufficient permissions or tokens
      unless can_generate_mock_tests?
        render json: { error: "Insufficient permissions or tokens to generate mock tests" }, status: :forbidden
        return
      end

      # Initialize the service
      service = AiMockTestGeneratorService.new(current_user)
      
      # Generate mock test for specific category
      result = service.generate_mock_test_for_category(category, question_count)
      
      if result[:success]
        render json: {
          message: "Mock test generated successfully",
          test_title: result[:test_title],
          test_id: result[:test_id],
          category_name: category.name
        }, status: :created
      else
        render json: {
          message: "Mock test generation skipped",
          reason: result[:reason],
          category_name: category.name
        }, status: :ok
      end
      
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Category not found" }, status: :not_found
    rescue => e
      Rails.logger.error "Error generating mock test for category: #{e.message}"
      render json: { error: "Failed to generate mock test: #{e.message}" }, status: :internal_server_error
    end
  end

  # GET /api/v1/ai_mock_tests/leaf_categories
  def leaf_categories
    begin
      leaf_categories = Category.leaf_categories.includes(:test_domain, :parent, :master_questions)
      
      categories_data = leaf_categories.map do |category|
        {
          id: category.id,
          name: category.name,
          slug: category.slug,
          test_domain: category.test_domain.name,
          full_path: category.full_path.map(&:name).join(" > "),
          has_questions: category.master_questions.any?,
          question_count: category.master_questions.count,
          depth: category.depth
        }
      end
      
      render json: {
        categories: categories_data,
        total_count: categories_data.count,
        with_questions: categories_data.count { |c| c[:has_questions] },
        without_questions: categories_data.count { |c| !c[:has_questions] }
      }, status: :ok
      
    rescue => e
      Rails.logger.error "Error fetching leaf categories: #{e.message}"
      render json: { error: "Failed to fetch leaf categories" }, status: :internal_server_error
    end
  end

  # GET /api/v1/ai_mock_tests/recent_tests
  def recent_tests
    begin
      # Get recent AI-generated tests
      recent_tests = Test.where(test_type: 'mock')
                        .where('created_at >= ?', 30.days.ago)
                        .order(created_at: :desc)
                        .limit(20)
                        .includes(:category, :test_domain)
      
      tests_data = recent_tests.map do |test|
        {
          id: test.id,
          name: test.title,
          category_name: test.category&.name || 'Unknown',
          test_domain: test.test_domain&.name || 'Unknown',
          question_count: test.sections.sum { |s| s.questions.count },
          created_at: test.created_at,
          status: test.status
        }
      end
      
      render json: {
        tests: tests_data,
        total_count: tests_data.count
      }, status: :ok
      
    rescue => e
      Rails.logger.error "Error fetching recent tests: #{e.message}"
      render json: { error: "Failed to fetch recent tests" }, status: :internal_server_error
    end
  end

  # GET /api/v1/ai_mock_tests/test_api
  def test_api
    begin
      success = AiMockTestGeneratorService.test_api
      
      if success
        render json: { 
          connected: true,
          message: "API connection successful"
        }, status: :ok
      else
        render json: { 
          connected: false,
          message: "API connection failed"
        }, status: :service_unavailable
      end
    rescue => e
      Rails.logger.error "Error testing API connection: #{e.message}"
      render json: { 
        connected: false,
        error: "Failed to test API connection: #{e.message}"
      }, status: :internal_server_error
    end
  end

  # GET /api/v1/ai_mock_tests/status_summary
  def status_summary
    begin
      leaf_categories = Category.leaf_categories.includes(:master_questions)
      
      total_categories = leaf_categories.count
      categories_with_questions = leaf_categories.count { |c| c.master_questions.any? }
      categories_without_questions = total_categories - categories_with_questions
      
      # Get recent AI-generated tests
      recent_tests = current_user.tests
                                .where(test_type: 'mock')
                                .where('created_at >= ?', 7.days.ago)
                                .order(created_at: :desc)
                                .limit(10)
      
      render json: {
        summary: {
          total_leaf_categories: total_categories,
          categories_with_questions: categories_with_questions,
          categories_without_questions: categories_without_questions,
          completion_percentage: total_categories > 0 ? (categories_with_questions.to_f / total_categories * 100).round(2) : 0
        },
        recent_ai_tests: recent_tests.map do |test|
          {
            id: test.id,
            title: test.title,
            created_at: test.created_at,
            total_marks: test.total_marks,
            status: test.status
          }
        end,
        can_generate: can_generate_mock_tests?
      }, status: :ok
      
    rescue => e
      Rails.logger.error "Error fetching AI mock test status: #{e.message}"
      render json: { error: "Failed to fetch status" }, status: :internal_server_error
    end
  end

  private

  def can_generate_mock_tests?
    # Add your permission logic here
    # For example, check if user has admin role, sufficient tokens, etc.
    
    # Check if user is admin or has special permissions
    return true if current_user.admin? || current_user.has_role?(:test_generator)
    
    # Check if user has sufficient tokens (if using token system)
    if defined?(UserWallet)
      wallet = UserWallet.find_or_create_by(user: current_user)
      return wallet.token_balance.to_i >= 100 # Minimum tokens required
    end
    
    # Default: allow if user is authenticated
    current_user.present?
  end
end 
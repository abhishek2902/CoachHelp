class Admin::QuestionsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  
  def index
    questions = Question.includes(:test)
    questions = questions.where(question_type: params[:type]) if params[:type].present?
    questions = questions.where("tags @> ARRAY[?]::varchar[]", [params[:tag]]) if params[:tag].present?
    
    paginated_questions = questions.page(params[:page]).per(ENV.fetch("CARD_DASHBOARD_PER_PAGE", 6).to_i)

    render json: {
      questions: paginated_questions.as_json(
        include: {
          test: {
            only: [:title],
            include: { user: { only: [:email] } }
          }
        }
      ),
      current_page: paginated_questions.current_page,
      total_pages: paginated_questions.total_pages,
      total_count: paginated_questions.total_count
    }
  end
end

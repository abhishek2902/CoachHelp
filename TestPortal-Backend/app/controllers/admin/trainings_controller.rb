class Admin::TrainingsController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  def index
    @trainings = Training.includes(:user, :training_sections, :training_questions)
                         .page(params[:page])
                         .per(ENV.fetch("CARD_DASHBOARD_PER_PAGE", 6).to_i)

    render json: {
      trainings: @trainings.as_json(include: [:user, :training_sections, :training_questions]),
      current_page: @trainings.current_page,
      total_pages: @trainings.total_pages,
      total_count: @trainings.total_count
    }
  end

  def show
    if params[:id].blank?
      render json: { error: 'Training not found' }, status: :not_found
      return
    end

    begin
      training = Training.includes({ training_sections: :training_questions }, :user).friendly.find(params[:id])
      render json: training.as_json(include: {
        user: { only: [:id, :email] },
        training_sections: {
          only: [:id, :name],
          include: {
            training_questions: {
              only: [:id, :content, :question_type, :marks, :option_1, :option_2, :option_3, :option_4]
            }
          }
        }
      })
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Training not found' }, status: :not_found
    end
  end

  def update
    training = Training.friendly.find(params[:id])
    if training.update(training_params)
      render json: { success: true, training: training }
    else
      render json: { success: false, errors: training.errors.full_messages }, status: 422
    end
  end

  def destroy
    training = Training.friendly.find(params[:id])
    training.destroy
    render json: { success: true }
  end

  private

  def training_params
    params.require(:training).permit(
      :title,
      :description,
      :content_html,
      :code,
      :avg_completed_time,
      :duration,
      :allow_retries,
      :status,
      :total_marks,
      :slug,
      :link_expires_date,
      :access_start_time
    )
  end
end

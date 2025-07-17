# app/controllers/api/v1/training_enrollments_controller.rb
class Api::V1::TrainingEnrollmentsController < ApplicationController
  before_action :authenticate_user!

  def by_training
    training = Training.find_by(id: params[:id])

    unless training
      return render json: { error: "Training not found" }, status: :not_found
    end

    enrollment = current_user.training_enrollments.find_by(training_id: training.id)

    unless enrollment
      return render json: { error: "You are not enrolled in this training" }, status: :not_found
    end

    total_questions = training.training_questions.count rescue 0 # adjust if needed

    render json: {
      status: enrollment.status,
      questions_attempted: enrollment.questions_attempted,
      total_questions: total_questions,
      started_at: enrollment.started_at,
      completed_at: enrollment.completed_at
    }
  end

  # GET /training_enrollments/attempt/:id
  def attempt
    training = Training.find_by(code: params[:id])

    return render json: { error: 'Training not found' }, status: :not_found unless training

    enrollment = current_user.training_enrollments.includes(training: { training_sections: :training_questions }).find_by(training_id: training.id)

    return render json: { error: 'Enrollment not found' }, status: :not_found unless enrollment

    if training.link_expires_date.present? && training.link_expires_date < Date.today
      return render json: { error: 'Training link has expired' }, status: :forbidden
    end

    training = enrollment.training

    training_data = training.as_json(
      # only: [:title, :description, :duration, :allow_retries, :link_expires_date],
      include: {
        training_sections: {
          include: :training_questions
        }
      }
    )
    training_data["pdf_file_urls"] = training.pdf_files.map { |file| url_for(file) }

    training_data["video_files"] = training.video_files.map { |file| url_for(file) }

    total_questions = training.training_questions.count rescue 0 # adjust if needed

    enrollment_data = enrollment.as_json
    enrollment_data["training"] = training_data
    enrollment_data["total_questions"] = total_questions
    enrollment_data["started_at"] = enrollment.started_at
    enrollment_data["completed_at"] = enrollment.completed_at

    render json: enrollment_data
  end

  def save
    enrollment = current_user.training_enrollments.find_by(id: params[:id])

    if enrollment.nil?
      render json: { error: 'Enrollment not found' }, status: :not_found and return
    end

    if enrollment.completed_at.present?
      render json: { error: 'Training already Completed' }, status: :forbidden and return
    end

    answers = params[:answers] || {}

    enrollment.responses_json = answers
    enrollment.questions_attempted = answers.keys.count

    if enrollment.save
      render json: { message: 'Training submitted successfully' }, status: :ok
    else
      render json: { errors: enrollment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def submit
    enrollment = current_user.training_enrollments.find_by(id: params[:id])
    
    if enrollment.nil?
      render json: { error: 'Enrollment not found' }, status: :not_found and return
    end

    if enrollment.completed_at.present?
      render json: { error: 'Training already Completed' }, status: :forbidden and return
    end

    answers = params[:answers] || {}

    enrollment.responses_json = answers
    enrollment.questions_attempted = answers.keys.count
    enrollment.completed_at = Time.current
    enrollment.calculate_score!
    enrollment.status="completed"

    if enrollment.save
      render json: { message: 'Training submitted successfully' }, status: :ok
    else
      render json: { errors: enrollment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def enroll
    training = Training.find_by!(code: params[:code])
    user = current_user

    expired_enrollment = training.link_expires_date && Date.current > training.link_expires_date

    existing_enrollment = training.training_enrollments.find_by(user_id: user.id)

    if expired_enrollment
      render json: { error: 'This traning has been expired.' }, status: :unprocessable_entity
    elsif existing_enrollment
      render json: { error: 'You are already enrolled in this training.' }, status: :unprocessable_entity
    else
      enrollment = training.training_enrollments.find_or_initialize_by(user_id: user.id)
      enrollment.assign_attributes(
        name: params[:name],
        email: params[:email],
        mobile: params[:mobile],
        institute: params[:institute],
        started_at: Time.current, # Only set if not already set
        status: 'in_progress' # or another appropriate status like 'enrolled'
      )

      if enrollment.save
        render json: { message: 'Enrolled successfully' }
      else
        render json: { error: enrollment.errors.full_messages.to_sentence }, status: :unprocessable_entity
      end
    end
  end

  def enrolled
    enrollments = current_user.training_enrollments.includes(:training).order(id: :desc)

    enrollments.each do |enrollment|
      training = enrollment.training

      if enrollment.started_at.present? &&
        training.duration.present? &&
        enrollment.completed_at.nil?

        end_time = enrollment.started_at + training.duration.hours

        if Time.current >= end_time
          enrollment.update(
            questions_attempted: enrollment.responses_json.select { |_, v| v.present? }.keys.count,
            completed_at: Time.current,
            status: 'completed'
          )
          enrollment.calculate_score! if enrollment.respond_to?(:calculate_score!)
          enrollment.save!
        end

        if training.link_expires_date && Date.current > training.link_expires_date
          enrollment.update(
            questions_attempted: enrollment.responses_json.select { |_, v| v.present? }.keys.count,
            completed_at: Time.current,
            status: 'expired'
          )
          enrollment.calculate_score! if enrollment.respond_to?(:calculate_score!)
          enrollment.save!
        end
      end

    end

    render json: enrollments.map { |enrollment|
      training = enrollment.training
      {
        training_enrollment_id: enrollment.id,
        status: enrollment.status,
        id: training.id,
        code:training.code,
        title: training.title,
        description: training.description,
        created_at: training.created_at,
        updated_at: training.updated_at,
        enrollment_status: enrollment.status,
        questions_attempted: enrollment.questions_attempted,
        started_at: enrollment.started_at,
        completed_at: enrollment.completed_at
      }
    }
  end

  def training_attempts_list
    training = Training.find_by(id: params[:training_id])

    if training.nil?
      return render json: { error: 'Training not found' }, status: :not_found
    end

    enrollments = training.training_enrollments.includes(:user).order(completed_at: :desc)
    render json: enrollments.as_json(only: [:id, :name, :email, :marks, :score, :started_at, :completed_at, :image_urls, :guest_token])
  end
end

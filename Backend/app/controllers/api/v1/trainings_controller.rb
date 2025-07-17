class Api::V1::TrainingsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :index]
  before_action :set_training, only: [:share, :upload_candidates_excel, :download_candidates_template]

  def set_training
    @training = Training.find_by!(code: params[:id])
  end

  # POST /api/v1/trainings
  def create
    training = current_user.trainings.new(training_params)

    if training.save
      render json: training_response(training), status: :created
    else
      Rails.logger.error training.errors.full_messages.to_sentence
      render json: { errors: training.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    training = current_user.trainings.find(params[:id])

    if params[:training][:existing_files_attributes]
      params[:training][:existing_files_attributes].each do |file_attr|
        if ActiveModel::Type::Boolean.new.cast(file_attr[:_destroy])
          attachment = ActiveStorage::Attachment.find_by(id: file_attr[:attachment_id])
          attachment&.purge
        end
      end
    end

    # Purge marked existing VIDEO files
    if params[:training][:existing_video_files_attributes]
      params[:training][:existing_video_files_attributes].each do |file_attr|
        if ActiveModel::Type::Boolean.new.cast(file_attr[:_destroy])
          attachment = ActiveStorage::Attachment.find_by(id: file_attr[:attachment_id])
          attachment&.purge
        end
      end
    end

    if params[:training][:new_files]
      params[:training][:new_files].each do |new_file|
        training.pdf_files.attach(new_file)
      end
    end

    if params[:training][:new_video_files]
      params[:training][:new_video_files].each do |new_file|
        training.video_files.attach(new_file)
      end
    end

    # if training.update(training_params.except(:new_files, :existing_files_attributes))
    if training.update(training_params.except(
      :new_files, :existing_files_attributes,
      :new_video_files, :existing_video_files_attributes
    ))
      render json: training_response(training), status: :ok
    else
      render json: { errors: training.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    training = current_user.trainings.find_by(id: params[:id])

    if training.nil?
      render json: { error: "Training not found or unauthorized" }, status: :not_found
      return
    end

    if training.destroy
      render json: { message: "Training deleted successfully" }, status: :ok
    else
      Rails.logger.error "Failed to delete training: #{training.errors.full_messages.to_sentence}"
      render json: { error: "Failed to delete training" }, status: :unprocessable_entity
    end
  end

  def show
    training = Training.includes(training_sections: :training_questions).find_by(slug: params[:id])

    if training.nil?
      render json: { error: 'Training not found' }, status: :not_found
      return
    end

    training_data = training.as_json(
      include: {
        training_sections: {
          include: :training_questions
        }
      }
    )
    
    training_data["pdf_file_urls"] = training.pdf_files.map { |file| url_for(file) }

    training_data["pdf_files"]= training.pdf_files.map do |file|
      {
        url: url_for(file),
        filename: file.filename.to_s,
        content_type: file.content_type,
        signed_id: file.signed_id,
        attachment_id: file.id
      }
    end

    training_data["video_files"] = training.video_files.map do |file|
      {
        url: url_for(file),
        filename: file.filename.to_s,
        content_type: file.content_type,
        signed_id: file.signed_id,
        attachment_id: file.id
      }
    end

    training_data["total_questions"] = training.training_questions.count rescue 0

    render json: training_data
  end


  # GET /api/v1/trainings/by_code/:code
  def by_code
    training = Training.find_by(code: params[:code])

    if training&.status == 'published'
      render json: training_response(training)
    else
      render json: { error: "Invalid or inactive training code" }, status: :not_found
    end
  end

  # GET /api/v1/trainings (creator dashboard)
  def index
    trainings = current_user.trainings.order(created_at: :desc)
    render json: trainings.map { |t| training_response(t) }
  end

  def share
    @training = Training.find_by(code: params[:id])
    candidates_params = params.require(:candidates)

    candidates_params.each do |candidate_params|
      ShareTrainingLinkJob.perform_async(
        candidate_params[:email],
        candidate_params[:name],
        @training.code,
      )
    end

    render json: { message: 'Links are being sent.' }, status: :ok
  end

  def download_candidates_template
    training = Training.find_by(code: params[:id])

    # generate a CSV file with header columns: Name, Email
    csv_data = CSV.generate(headers: true) do |csv|
      csv << ["Name", "Email"]
    end

    # send_data csv_data, filename: "candidates_template_#{test.slug}.csv"
    send_data csv_data, filename: "candidates_template_#{training.code}.csv"
  end

  def upload_candidates_excel
    training = Training.find_by(code: params[:id])

    file = params[:file]
    unless file
      return render json: { error: 'No file uploaded' }, status: :unprocessable_entity
    end

    candidates = ExcelImportService.new(file.path).parse_candidates
    Rails.logger.info "Parsed candidates: #{candidates.inspect}"

    if candidates.empty?
      return render json: { error: 'No valid candidates found in the file' }, status: :unprocessable_entity
    end

    TrainingCandidateBulkUploadJob.perform_async(
      training.id,
      candidates,
      current_user.email
    )

    render json: { message: "Training links have been sent successfully. Candidates will receive their invitations shortly." }, status: :ok
  end

  private

  def training_params
    params.require(:training).permit(
      :title,
      :description,
      :content_html,
      :code,
      :allow_retries,
      :duration,
      :avg_completed_time,
      :status, :link_expires_date,
      pdf_files: [],
      new_files: [],
      video_files: [],
      existing_files_attributes: [:attachment_id, :_destroy],
      new_video_files: [],
      existing_video_files_attributes: [:attachment_id, :signed_id, :_destroy],
      training_sections_attributes: [
        :id, :name, :duration, :_destroy,:content_html,
        training_questions_attributes: [
          :id, :content, :marks, :question_type, :correct_answer, :tags,
          :option_1, :option_2, :option_3, :option_4, :_destroy
        ]
      ]
    )
  end

  def training_response(training)
    {
      id: training.id,
      title: training.title,
      description: training.description,
      content_html: training.content_html,
      code: training.code,
      slug: training.slug,
      allow_retries: training.allow_retries,
      status: training.status,
      duration: training.duration,
      avg_completed_time: training.avg_completed_time,
      created_at: training.created_at,

      sections: training.training_sections.order(:id).map do |section|
        {
          id: section.id,
          name: section.name,
          duration: section.duration,
          questions: section.training_questions.order(:id).map do |q|
            {
              id: q.id,
              content: q.content,
              marks: q.marks,
              question_type: q.question_type,
              tags: q.tags,
              correct_answer: q.correct_answer,
              options: [q.option_1, q.option_2, q.option_3, q.option_4]
            }
          end
        }
      end,

      pdf_files: training.pdf_files.map do |file|
        {
          name: file.filename.to_s,
          url: Rails.application.routes.url_helpers.rails_blob_url(file, only_path: false)
        }
      end,
      video_files: training.video_files.map do |file|
        {
          name: file.filename.to_s,
          url: Rails.application.routes.url_helpers.rails_blob_url(file, only_path: false)
        }
      end
    }
  end
end

class Api::V1::TestsController < ApplicationController
  before_action :authenticate_user!, except: [:find_by_code, :access_check]
  before_action :set_test, only: [:show, :update, :destroy, :unpublish, :generate_link, :share, :clone_category]

  def index
    begin
      @tests = current_user.tests
                         .includes(sections: [:questions, :coding_tests])
                         .order(created_at: :desc)
                         .page(params[:page])
                         .per(params[:per_page] || 10)

      response.headers['X-Total-Count'] = @tests.total_count.to_s
      response.headers['X-Total-Pages'] = @tests.total_pages.to_s
      response.headers['X-Current-Page'] = @tests.current_page.to_s
      response.headers['X-Per-Page'] = @tests.limit_value.to_s

      render json: @tests
    rescue => e
      Rails.logger.error "Error fetching tests: #{e.message}"
      render json: { error: "Failed to fetch tests" }, status: :internal_server_error
    end
  end

  def clone_category
    begin
      Rails.logger.debug "Params: \\#{params.inspect}"
      category_id = params[:category_id] || params.dig(:category, :id)
      raise "No category_id provided" unless category_id
      service = MasterQuestionCloneService.new(nil, current_user)
      section = service.clone_to_existing_test(@test, category_id)
      render json: { message: "Section cloned successfully", section_id: section.id }, status: :created
    rescue => e
      Rails.logger.error "Error cloning category: \\#{e.message}"
      render json: { error: "Failed to clone section: \\#{e.message}" }, status: :unprocessable_entity
    end
  end

  def clone_category_section
    begin
      test = Test.friendly.find(params[:id])
      category = Category.friendly.find(params[:category_id])
      service = MasterQuestionCloneService.new(category.id, current_user)
      section = service.clone_to_existing_test(test, category.id)
      render json: { message: "Section cloned successfully", section_id: section.id }, status: :created
    rescue => e
      Rails.logger.error "Error cloning category section: #{e.message}"
      render json: { error: "Failed to clone section: #{e.message}" }, status: :unprocessable_entity
    end
  end

  def show
    begin
      if @test.user_id != current_user.id
        head :forbidden
      else
        @test = Test.includes(sections: [:questions, :coding_tests]).find(@test.id)
        render json: @test, include: { sections: { include: [:questions, :coding_tests] } }
      end
    rescue => e
      Rails.logger.error "Error showing test: #{e.message}"
      render json: { error: "Failed to retrieve test" }, status: :internal_server_error
    end
  end

  def create
    begin
      # Get permitted parameters and convert to regular hash
      permitted_params = test_params.to_h
      
      test = current_user.tests.build(permitted_params)

      # Check if test is being published
      is_publishing = test.status == "published"

      if is_publishing
        # Find active subscription
        subscription = current_user.subscriptions
                                  .where(status: "active")
                                  .where("start_date <= ? AND end_date >= ?", Time.current, Time.current)
                                  .order(end_date: :desc)
                                  .first

        if subscription.nil? || subscription.tests_remaining <= 0
          render json: {
            errors: ["You have no remaining test attempts. Please upgrade your plan or save as draft."]
          }, status: :unprocessable_entity and return
        end
      end

      # Validate test data before saving
      unless validate_test_data(test)
        render json: { errors: ["Invalid test data provided"] }, status: :unprocessable_entity and return
      end

      if test.save
        Notification.create!(
          user: current_user,
          message: "Your test '#{test.title}' was created successfully.",
          notifiable: test
        )
        render json: { message: "✅ Test #{is_publishing ? 'published' : 'saved as draft'} successfully.", test: test }, status: :created
      else
        Rails.logger.error "Test creation errors: #{test.errors.full_messages}"
        Rails.logger.error "Test params: #{permitted_params.inspect}"
        render json: { errors: test.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error creating test: #{e.message}"
      render json: { error: "Failed to create test" }, status: :internal_server_error
    end
  end

  def update
    begin
      if @test.status == "published"
        return render json: { error: "Test is published. Only status can be updated." }, status: :forbidden
      end

      # Debug: Log the incoming parameters
      Rails.logger.debug "Update params: #{params.inspect}"
      Rails.logger.debug "Test params: #{params[:test].inspect}"

      # Get permitted parameters and convert to regular hash
      permitted_params = test_params.to_h
      
      Rails.logger.debug "Final permitted_params: #{permitted_params.inspect}"

      # Check if status is being changed to published
      is_publishing_now = permitted_params[:status] == "published" && @test.status != "published"

      if is_publishing_now
        subscription = current_user.subscriptions
                                  .where(status: "active")
                                  .where("start_date <= ? AND end_date >= ?", Time.current, Time.current)
                                  .order(end_date: :desc)
                                  .first

        if subscription.nil? || subscription.tests_remaining <= 0
          return render json: { error: "❌ You have no remaining test attempts. Please upgrade your plan or save as draft." }, status: :unprocessable_entity
        end
              end

        # Validate test data before updating
      unless validate_test_data_for_update(permitted_params)
        render json: { errors: ["Invalid test data provided"] }, status: :unprocessable_entity and return
      end

      if @test.update(permitted_params)
        @test = Test.includes(sections: [:questions, :coding_tests]).find(@test.id)
        render json: @test, include: { sections: { include: [:questions, :coding_tests] } }
      else
        Rails.logger.error "Test update failed with errors: #{@test.errors.full_messages}"
        Rails.logger.error "Test validation details: #{@test.errors.details}"
        render json: { errors: @test.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error updating test: #{e.message}"
      render json: { error: "Failed to update test" }, status: :internal_server_error
    end
  end

  def unpublish
    begin
      if @test.status != "published"
        return render json: { error: "Only published tests can be unpublished." }, status: :unprocessable_entity
      end

      if @test.update(status: "unpublish", test_code: nil)
        render json: { message: "Test successfully unpublished.", test: @test }
      else
        render json: { errors: @test.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error unpublishing test: #{e.message}"
      render json: { error: "Failed to unpublish test" }, status: :internal_server_error
    end
  end

  def destroy
    begin
      @test.destroy!
      render json: { message: "Test deleted successfully" }, status: :ok
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Test not found" }, status: :not_found
    rescue => e
      Rails.logger.error "Error deleting test: #{e.message}"
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def find_by_code
    begin
      @test = Test.includes(sections: [:questions, :coding_tests]).find_by(test_code: params[:code])

      if @test.nil?
        return render json: { errors: "Invalid test code" }, status: :not_found
      end

      unless @test.accessible_now?
        return render json: { error: "Test access is not allowed at this time" }, status: :forbidden
      end

      unless @test.within_access_window?
        render json: { error: "Not allowed" }, status: :forbidden unless @test.accessible_now?
      end

      test_creator = @test.user
      @subscription = validate_subscription!(test_creator)

      render json: @test, serializer: TestSerializer
    rescue StandardError => e
      Rails.logger.error "Error finding test by code: #{e.message}"
      render json: { errors: e.message }, status: :unprocessable_entity
    end
  end

  def access_check
    begin
      test = Test.friendly.find(params[:id])
      return render json: { accessible: false, message: "Test not found." }, status: :not_found unless test

      unless test.accessible_now?
        return render json: { error: "Test access is not allowed at this time" }, status: :forbidden
      end

      unless test.within_access_window?
        render json: { error: "Not allowed" }, status: :forbidden unless test.accessible_now?
      end

      render json: { accessible: true }
    rescue => e
      Rails.logger.error "Error checking test access: #{e.message}"
      render json: { error: "Failed to check test access" }, status: :internal_server_error
    end
  end

  def export_csv
    begin
      ExportCsvJob.perform_async(current_user.id)
      render json: { message: "CSV export is being generated. You'll be notified when it's ready." }, status: :accepted
    rescue => e
      Rails.logger.error "Error exporting CSV: #{e.message}"
      render json: { error: "Failed to export CSV" }, status: :internal_server_error
    end
  end

  def export_download
    begin
      file_variant = params[:variant]

      file_name = case file_variant
                  when "test"
                    "Sample_test_excel_sheet.xlsx"
                  when "sample"
                    "Sample_excel_sheet.xlsx"
                  end

      file_path = Rails.root.join("tmp", "storage", file_name)

      if File.exist?(file_path)
        send_file file_path,
                  filename: file_name,
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      else
        render json: { message: "File not ready" }, status: :accepted
      end
    rescue => e
      Rails.logger.error "Error downloading export: #{e.message}"
      render json: { error: "Failed to download export" }, status: :internal_server_error
    end
  end

  def upload_excel
    begin
      unless params[:file].present?
        return render json: { error: "No file uploaded" }, status: :bad_request
      end

      uploaded_file = params[:file]
      file_content = Base64.strict_encode64(File.read(uploaded_file.tempfile.path))

      UploadExcelJob.perform_async({
        "user_id" => current_user.id,
        "file_name" => uploaded_file.original_filename,
        "file_content" => file_content
      })

      render json: { message: 'File is being processed.' }
    rescue => e
      Rails.logger.error("Upload error: #{e.message}")
      Sentry.capture_exception(e)
      render json: { error: "Internal server error" }, status: :internal_server_error
    end
  end

  def generate_link
    begin
      link = TestLinkGeneratorService.new(@test).generate_link
      render json: { link: link }
    rescue => e
      Rails.logger.error "Error generating link: #{e.message}"
      render json: { error: "Failed to generate link" }, status: :internal_server_error
    end
  end

  def share
    begin
      candidates_params = params.require(:candidates)

      candidates_params.each do |candidate_params|
        ShareTestLinkJob.perform_async(
          candidate_params[:email],
          candidate_params[:name],
          @test.slug,
          )
      end

      render json: { message: 'Links are being sent.' }, status: :ok
    rescue => e
      Rails.logger.error "Error sharing test: #{e.message}"
      render json: { error: "Failed to share test" }, status: :internal_server_error
    end
  end

  def total_count
    begin
      tests = current_user.tests

      total_count = tests.count
      draft_count = tests.where(status: 'draft').count
      pending_count = tests.where(status: 'pending').count
      published_count = tests.where(status: 'published').count
      unpublished_count = tests.where(status: 'unpublish').count

      render json: {
        total_count: total_count,
        draft_count:draft_count,
        pending_count: pending_count,
        published_count: published_count,
        unpublish_count: unpublished_count
      }
    rescue => e
      Rails.logger.error "Error getting total count: #{e.message}"
      render json: { error: "Failed to get total count" }, status: :internal_server_error
    end
  end

  def download_candidates_template
    begin
      test = Test.friendly.find(params[:id])  # <- works with slugs too

      # generate a CSV file with header columns: Name, Email
      csv_data = CSV.generate(headers: true) do |csv|
        csv << ["Name", "Email"]
      end

      send_data csv_data, filename: "candidates_template_#{test.slug}.csv"
    rescue => e
      Rails.logger.error "Error downloading template: #{e.message}"
      render json: { error: "Failed to download template" }, status: :internal_server_error
    end
  end

  def upload_candidates_excel
    begin
      test = Test.friendly.find(params[:id])

      file = params[:file]
      unless file
        return render json: { error: 'No file uploaded' }, status: :unprocessable_entity
      end

      candidates = ExcelImportService.new(file.path).parse_candidates
      Rails.logger.info "Parsed candidates: #{candidates.inspect}"

      if candidates.empty?
        return render json: { error: 'No valid candidates found in the file' }, status: :unprocessable_entity
      end

      CandidateBulkUploadJob.perform_async(
        test.id,
        candidates,
        current_user.email
        )

      render json: { message: "Test-Link has been sent successfully.Candidates will receive their test links shortly." }, status: :ok
    rescue => e
      Rails.logger.error "Error uploading candidates: #{e.message}"
      render json: { error: "Failed to upload candidates" }, status: :internal_server_error
    end
  end

def bulk_delete
  test_ids = params[:ids]

  if test_ids.blank? || !test_ids.is_a?(Array)
    return render json: { error: "Invalid request. Expected an array of IDs." }, status: :bad_request
  end

  # Get only deletable tests (exclude published & unpublished)
  deletable_tests = current_user.tests.where(id: test_ids).where.not(status: ['published', 'unpublished'])
  skipped_tests = current_user.tests.where(id: test_ids).where(status: ['published', 'unpublished'])

  deleted = deletable_tests.destroy_all

  render json: {
    success: true,
    deleted_count: deleted.size,
    skipped_count: skipped_tests.size,
    skipped_titles: skipped_tests.pluck(:title)
  }, status: :ok
rescue => e
  Rails.logger.error("Bulk delete failed: #{e.message}")
  render json: { error: "Something went wrong while deleting." }, status: :internal_server_error
end

  private

  def set_test
    @test = current_user.tests.friendly.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Test not found" }, status: :not_found
  end

  def validate_test_data(test)
    return false if test.title.blank? && test.status != 'draft'
    return false if test.duration.blank? && test.status != 'draft'
    return false if test.duration.to_i <= 0 && test.status != 'draft'
    
    # Validate sections if present
    if test.sections.any?
      test.sections.each do |section|
        return false if section.name.blank?
        return false if section.duration.to_i < 0
        
        # Validate questions in section
        if section.questions.any?
          section.questions.each do |question|
            return false if question.content.blank? && test.status != 'draft'
            return false if question.marks.to_i <= 0 && test.status != 'draft'
          end
        end
        
        # Validate coding tests in section
        if section.coding_tests.any?
          section.coding_tests.each do |coding_test|
            return false if coding_test.title.blank? && test.status != 'draft'
            return false if coding_test.description.blank? && test.status != 'draft'
            return false if coding_test.marks.to_i <= 0 && test.status != 'draft'
            return false if coding_test.test_cases.empty? && test.status != 'draft'
          end
        end
      end
    end
    
    true
  end

  def validate_test_data_for_update(params)
    Rails.logger.debug "=== VALIDATION DEBUG ==="
    Rails.logger.debug "Status: #{params['status']}"
    Rails.logger.debug "Title blank?: #{params['title'].blank?}"
    Rails.logger.debug "Duration blank?: #{params['duration'].blank?}"
    Rails.logger.debug "Duration <= 0?: #{params['duration'].to_i <= 0}"
    
    return false if params['title'].blank? && params['status'] != 'draft'
    return false if params['duration'].blank? && params['status'] != 'draft'
    return false if params['duration'].to_i <= 0 && params['status'] != 'draft'
    
    # Validate sections if present
    if params['sections_attributes']
      params['sections_attributes'].each_with_index do |section_attrs, index|
        Rails.logger.debug "Section #{index}: name=#{section_attrs['name']}, duration=#{section_attrs['duration']}"
        return false if section_attrs['name'].blank?
        return false if section_attrs['duration'].to_i < 0
        
        # Validate questions in section
        if section_attrs['questions_attributes']
          section_attrs['questions_attributes'].each_with_index do |question_attrs, q_index|
            next if question_attrs['_destroy']
            Rails.logger.debug "  Question #{q_index}: content=#{question_attrs['content'].present?}, marks=#{question_attrs['marks']}"
            return false if question_attrs['content'].blank? && params['status'] != 'draft'
            return false if question_attrs['marks'].to_i <= 0 && params['status'] != 'draft'
          end
        end
        
        # Validate coding tests in section
        if section_attrs['coding_tests_attributes']
          section_attrs['coding_tests_attributes'].each_with_index do |coding_test_attrs, ct_index|
            next if coding_test_attrs['_destroy']
            Rails.logger.debug "  Coding Test #{ct_index}: title=#{coding_test_attrs['title']}, description=#{coding_test_attrs['description'].present?}, marks=#{coding_test_attrs['marks']}, test_cases=#{coding_test_attrs['test_cases_attributes'].inspect}"
            return false if coding_test_attrs['title'].blank? && params['status'] != 'draft'
            return false if coding_test_attrs['description'].blank? && params['status'] != 'draft'
            return false if coding_test_attrs['marks'].to_i <= 0 && params['status'] != 'draft'
            return false if coding_test_attrs['test_cases_attributes'].blank? && params['status'] != 'draft'
          end
        end
      end
    end
    
    Rails.logger.debug "=== VALIDATION PASSED ==="
    true
  end

  def test_params
    # First, permit all parameters to avoid UnfilteredParameters error
    permitted_params = params.require(:test).permit!

    # Convert to hash immediately to avoid ActionController::Parameters issues
    permitted_params = permitted_params.to_h

    # Convert hashes with numeric keys to arrays
    deep_convert_hashes_to_arrays!(permitted_params)

    # Force top-level sections_attributes to be an array if it's a hash with integer keys
    if permitted_params[:sections_attributes].is_a?(Hash)
      sections_hash = permitted_params[:sections_attributes]
      if sections_hash.keys.all? { |k| k.to_s =~ /\A\d+\z/ }
        sections_array = []
        sections_hash.keys.sort_by(&:to_i).each do |key|
          sections_array << sections_hash[key]
        end
        permitted_params[:sections_attributes] = sections_array
      end
    end

    # Process coding_tests_attributes to ensure proper structure and convert difficulty
    permitted_params[:sections_attributes]&.each do |section_attrs|
      # Convert section_attrs to hash if it's ActionController::Parameters
      if section_attrs.is_a?(ActionController::Parameters)
        section_attrs = section_attrs.permit!.to_h
      end
      
      # Convert questions_attributes from hash to array if needed
      if section_attrs[:questions_attributes].is_a?(Hash)
        questions_hash = section_attrs[:questions_attributes]
        if questions_hash.keys.all? { |k| k.to_s =~ /\A\d+\z/ }
          questions_array = []
          questions_hash.keys.sort_by(&:to_i).each do |key|
            questions_array << questions_hash[key]
          end
          section_attrs[:questions_attributes] = questions_array
        end
      end
      
      # Convert coding_tests_attributes from hash to array if needed
      if section_attrs[:coding_tests_attributes].is_a?(Hash)
        coding_tests_hash = section_attrs[:coding_tests_attributes]
        if coding_tests_hash.keys.all? { |k| k.to_s =~ /\A\d+\z/ }
          coding_tests_array = []
          coding_tests_hash.keys.sort_by(&:to_i).each do |key|
            coding_test_data = coding_tests_hash[key]
            
            # Convert coding_test_data to hash if it's ActionController::Parameters
            if coding_test_data.is_a?(ActionController::Parameters)
              coding_test_data = coding_test_data.permit!.to_h
            end
            
            # Also convert test_cases_attributes from hash to array if needed
            if coding_test_data[:test_cases_attributes].is_a?(Hash)
              test_cases_array = []
              coding_test_data[:test_cases_attributes].keys.sort_by(&:to_i).each do |tc_key|
                test_case_data = coding_test_data[:test_cases_attributes][tc_key]
                # Convert test_case_data to hash if it's ActionController::Parameters
                if test_case_data.is_a?(ActionController::Parameters)
                  test_case_data = test_case_data.permit!.to_h
                end
                test_cases_array << test_case_data
              end
              coding_test_data[:test_cases_attributes] = test_cases_array
            end
            
            # Convert difficulty to integer
            if coding_test_data[:difficulty]
              coding_test_data[:difficulty] = coding_test_data[:difficulty].to_i
            end
            
            coding_tests_array << coding_test_data
          end
          section_attrs[:coding_tests_attributes] = coding_tests_array
        end
      end
    end

    permitted_params
  end

  # Recursively convert all hashes with integer-like string keys to arrays
  def deep_convert_hashes_to_arrays!(obj)
    if obj.is_a?(Hash)
      # Check if all keys are numeric strings
      if obj.keys.all? { |k| k.to_s =~ /\A\d+\z/ }
        arr = obj.keys.sort_by(&:to_i).map { |k| obj[k] }
        arr.each { |v| deep_convert_hashes_to_arrays!(v) }
        obj.clear
        arr.each_with_index { |v, i| obj[i] = v }
        return arr
      else
        # For non-numeric keys, still process nested values
        obj.each { |_, v| deep_convert_hashes_to_arrays!(v) }
      end
    elsif obj.is_a?(Array)
      obj.each { |v| deep_convert_hashes_to_arrays!(v) }
    end
    obj
  end

  def process_excel_file(job_args)
    # Pass a single hash argument to the job
    UploadExcelJob.perform_async(job_args)
    { message: "File upload started", status: "processing" }
  end

  def validate_subscription!(user)
    subscription = user.subscriptions
                       .where(status: 'active')
                       .where("tests_remaining > 0")
                       .first

    raise StandardError.new("The test creator does not have any remaining test attempts. Please ask test creator to subscribe the latest plan.") unless subscription

    subscription
  end
end

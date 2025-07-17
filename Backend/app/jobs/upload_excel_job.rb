require 'roo'
require 'base64'

class UploadExcelJob
  include Sidekiq::Job
  queue_as :default

  def perform(args)
    user_id     = args["user_id"]
    file_name   = args["file_name"]
    file_content = args["file_content"]
    user        = User.find(user_id)

    temp_file = nil
    errors = []

    begin
      decoded_content = Base64.decode64(file_content)
      temp_file = Tempfile.new(['upload', File.extname(file_name)])
      temp_file.binmode
      temp_file.write(decoded_content)
      temp_file.rewind

      xlsx = Roo::Excelx.new(temp_file.path)
      xlsx.default_sheet = xlsx.sheets.first

      # === Extract Test Details (Row 3) ===
      test_title       = xlsx.cell(3, 2).to_s.strip
      test_description = xlsx.cell(3, 3).to_s.strip
      raise "Missing test title" if test_title.blank?

      # === Extract Section Details ===
      section_data = {}
      section_start_row = 6

      while (section_name = xlsx.cell(section_start_row, 2).to_s.strip).present?
        break if section_name.downcase.include?("questions details")

        duration = xlsx.cell(section_start_row, 3).to_i
        if duration <= 0
          errors << "Section '#{section_name}' has invalid or missing duration"
        else
          section_data[section_name] = duration
        end
        section_start_row += 1
      end
      # === Find Question Header Row ===
      questions_header_row = section_start_row + 1
      headers = xlsx.row(questions_header_row).map(&:to_s)

      # === Extract Questions ===
      questions = []
      if headers.any? { |h| h.present? }
        ((questions_header_row + 1)..xlsx.last_row).each do |i|
          row = Hash[headers.zip(xlsx.row(i).map { |val| val.to_s.strip })]
          next if row.values.all?(&:blank?)

          section = row["Section Name"]
          type    = row["Question Type"]
          marks   = row["Marks"].to_i
          content = row["Question Content"]
          answer  = row["Correct Answer"]
          options = [row["Option 1"], row["Option 2"], row["Option 3"], row["Option 4"]]

          # Check if section exists in section_data
          unless section_data.key?(section)
            errors << "Row #{i}: Section '#{section}' not found in section list."
            next
          end

          missing_fields = []
          missing_fields << 'section' if section.blank?
          missing_fields << 'type' if type.blank?
          missing_fields << 'Questions content' if content.blank?
          missing_fields << 'marks' if marks <= 0
          missing_fields << 'answer' if answer.blank? && %w[MCQ MSQ].include?(type.to_s.upcase)
          
          if missing_fields.any?
            errors << "Row #{i}: Missing required fields (#{missing_fields.join('/')})"
            next
          end

          if %w[MCQ MSQ].include?(type.upcase) && options.any?(&:blank?)
            errors << "Row #{i}: Missing options for #{type}"
            next
          end

          questions << {
            section: section,
            type: type,
            marks: marks,
            content: content,
            correct_answer: %w[MCQ].include?(type.upcase) ? answer.to_i : answer,
            options: %w[MCQ MSQ].include?(type.upcase) ? options : []
          }
        end
      end

      # === Create Test ===
      test = user.tests.create!(
        title: test_title,
        description: test_description,
        test_type: "Imported",
        duration: section_data.values.sum,
        total_marks: 0
      )

      section_records = {}
      total_marks = 0

      section_data.each do |name, duration|
        section_records[name] = test.sections.create!(name: name, duration: duration)
      end

      questions.each do |q|
        begin
          section = section_records[q[:section]]
          section.questions.create!(
            question_type: q[:type],
            marks: q[:marks],
            content: q[:content],
            correct_answer: q[:correct_answer],
            tags: '',
            option_1: q[:options][0] || '',
            option_2: q[:options][1] || '',
            option_3: q[:options][2] || '',
            option_4: q[:options][3] || ''
          )
          total_marks += q[:marks]
        rescue => e
          errors << "Row with question '#{q[:content]}' failed to save: #{e.message}"
        end
      end

      test.update!(total_marks: total_marks)

      # === Handle Completion ===
      if errors.any?
        Rails.cache.write("upload_errors_user_#{user.id}", errors, expires_in: 10.minutes)
        UserExcelUploadJob.perform_later(user_id: user.id, file_name: file_name, success: false, errors: errors)
      else
        Rails.cache.delete("upload_errors_user_#{user.id}")
        UserExcelUploadJob.perform_later(user_id: user.id, file_name: file_name, success: true)
      end

    rescue => e
      Rails.logger.error("UploadExcelJob failed: #{e.message}")
      Rails.cache.write("upload_errors_user_#{user.id}", ["Fatal error: #{e.message}"], expires_in: 10.minutes)
      UserExcelUploadJob.perform_later(user_id: user.id, file_name: file_name, success: false, errors: [e.message])
    ensure
      temp_file&.close
      temp_file&.unlink
    end
  end
end

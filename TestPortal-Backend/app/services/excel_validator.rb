# app/services/excel_validator.rb
class ExcelValidator
  def initialize(file_path)
    @file_path = file_path
    @errors = []
  end

  def validate
    xlsx = Roo::Excelx.new(@file_path)

    xlsx.sheets.each do |sheet|
      xlsx.default_sheet = sheet

      title = xlsx.cell(1, 1)
      test_type = xlsx.cell(3, 1)
      @errors << "Sheet '#{sheet}': Missing test title." if title.blank?
      @errors << "Sheet '#{sheet}': Missing test type." if test_type.blank?

      current_section = nil

      (4..xlsx.last_row).each do |i|
        row = xlsx.row(i)
        next if row.compact.empty? || row[0].to_s.strip == "Question Type"

        if row[0].to_s.strip.downcase.start_with?("section:")
          section_name = row[0].split(":").last&.strip
          duration_value = row[1]

          if section_name.blank?
            @errors << "Row #{i}: Section name is missing."
          end

          # Validate section duration if present
          if duration_value.blank?
            @errors << "Row #{i}: Section duration is missing."
          elsif !(duration_value.to_s.strip.match?(/^\d+$/) && duration_value.to_i > 0)
            @errors << "Row #{i}: Invalid section duration. It must be a positive number."
          end

          current_section = section_name
          next
        end

        question_type = row[0].to_s.strip
        marks = row[1].to_i
        content = row[2].to_s.strip
        correct_answer = row[3].to_s.strip
        tags = row[4].to_s.strip
        options = row[5..8].map(&:to_s)

        @errors << "Row #{i}: Question found before any section." if current_section.nil?
        @errors << "Row #{i}: Missing question type." if question_type.blank?
        @errors << "Row #{i}: Missing question content." if content.blank?
        @errors << "Row #{i}: Marks must be greater than 0." if marks <= 0
        @errors << "Row #{i}: Tags are required." if tags.blank?

        case question_type.downcase
        when "mcq", "msq"
          if options.any?(&:blank?)
            @errors << "Row #{i}: MCQ/MSQ must have all 4 options."
          end
          if correct_answer.blank?
            @errors << "Row #{i}: Correct answer is required for #{question_type.upcase}."
          end
        when "theoretical"
          if correct_answer.blank?
            @errors << "Row #{i}: Correct answer is required for Theoretical questions."
          end
        else
          @errors << "Row #{i}: Unknown question type '#{question_type}'."
        end
      end

    end

    @errors
  rescue => e
    Rails.logger.error("ExcelValidator error: #{e.message}")
    ["Invalid Excel format: The uploaded file format is not supported. Please ensure it follows the correct Excel template."]
  end
end

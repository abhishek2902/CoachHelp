# app/jobs/export_csv_job.rb
require 'axlsx'

class ExportCsvJob
  include Sidekiq::Job
  queue_as :default
  def perform(user_id)
    user = User.find(user_id)
    tests = user.tests.includes(questions: :section)

    p = Axlsx::Package.new
    wb = p.workbook

    bold_center = wb.styles.add_style(b: true, alignment: { horizontal: :center })
    center = wb.styles.add_style(alignment: { horizontal: :center, wrap_text: true })

    wb.add_worksheet(name: "Tests Export") do |sheet|
      tests.each_with_index do |test, index|
        sheet.add_row ["Test ##{index + 1}"], style: bold_center
        sheet.add_row ["Title", "Description", "Type", "Duration", "Total Questions"], style: bold_center
        sheet.add_row [
          test.title,
          test.description,
          test.test_type,
          test.duration,
          test.questions.count
        ], style: center

        sheet.add_row []

        grouped_questions = test.questions.group_by(&:section)

        grouped_questions.each do |section, questions|
          section_name = section&.name || "Uncategorized"
          sheet.add_row ["Section: #{section_name}"], style: bold_center

          questions.each do |q|
            is_theoretical = q.question_type.downcase == 'theoretical'

            headers = ["Question Type", "Marks", "Question Content", "Correct Answer", "Tags"]
            headers += ["Option 1", "Option 2", "Option 3", "Option 4"] unless is_theoretical
            sheet.add_row headers, style: bold_center

            row = [
              q.question_type,
              q.marks,
              strip_html(q.content),
              strip_html(q.correct_answer),
              q.tags
            ]
            unless is_theoretical
              row += [
                strip_html(q.option_1),
                strip_html(q.option_2),
                strip_html(q.option_3),
                strip_html(q.option_4)
              ]
            end
            sheet.add_row row, style: center
          end
          sheet.add_row []
        end
        sheet.add_row []
      end
    end
    file_path = Rails.root.join("tmp", "tests_export_#{user.id}.xlsx")
    p.serialize(file_path.to_s)

    # Optional: email or notify user
  end

  private

  def strip_html(text)
    ActionView::Base.full_sanitizer.sanitize(text.to_s)
  end
end
# app/jobs/mailers/user_excel_upload_job.rb
class UserExcelUploadJob < ApplicationJob
  queue_as :mailers

  def perform(user_id:, file_name:, success:, errors: [])
    user = User.find(user_id)

    if success
      UserMailer.excel_upload_success(user, file_name).deliver_later
    else
      UserMailer.excel_upload_failure(user, file_name, errors).deliver_later
    end
  end
end

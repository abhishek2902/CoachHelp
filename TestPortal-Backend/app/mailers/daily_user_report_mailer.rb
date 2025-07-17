class DailyUserReportMailer < ApplicationMailer
  def daily_user_report(admin_email, user_count, excel_file_path)
    @user_count = user_count
    @date = Date.current.strftime("%B %d, %Y")
    
    attachments["daily_user_report_#{Date.current.strftime('%Y-%m-%d')}.xlsx"] = File.read(excel_file_path)
    
    mail(
      to: admin_email,
      subject: "Daily User Report - #{@date} - #{@user_count} new users created"
    )
  end
end 
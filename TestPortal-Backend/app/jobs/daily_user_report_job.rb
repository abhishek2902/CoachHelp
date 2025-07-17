class DailyUserReportJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "Starting daily user report generation for #{Date.current}"
    # debugger
    # Get users created today
    today_users = User.where(created_at: Date.current.beginning_of_day..Date.current.end_of_day)
    user_count = today_users.count
    
    Rails.logger.info "Found #{user_count} users created today"
    
    # Generate Excel file
    excel_file_path = generate_excel_report(today_users)
    
    # Get admin email from environment variable or use default
    admin_email = ENV['DAILY_REPORT_ADMIN_EMAIL'] || 'support@talenttest.io'
    
    # Send email with attachment
    DailyUserReportMailer.daily_user_report(admin_email, user_count, excel_file_path).deliver_now
    
    Rails.logger.info "Daily user report sent to #{admin_email}"
    
    # Clean up temporary file
    File.delete(excel_file_path) if File.exist?(excel_file_path)
    
  rescue => e
    Rails.logger.error "Error in DailyUserReportJob: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
  end

  private

  def generate_excel_report(users)
    require 'axlsx'
    
    # Create temporary file path
    file_path = Rails.root.join('tmp', "daily_user_report_#{Date.current.strftime('%Y-%m-%d')}.xlsx")
    
    # Create Excel workbook
    package = Axlsx::Package.new
    workbook = package.workbook
    
    # Add worksheet
    workbook.add_worksheet(name: "Daily User Report") do |sheet|
      # Add headers
      sheet.add_row([
        'User ID',
        'First Name',
        'Last Name', 
        'Email',
        'Created At',
        'Confirmed At',
        'Organization',
        'Referral Code'
      ], style: workbook.styles.add_style(b: true, bg_color: 'E3F2FD'))
      
      # Add user data
      users.each do |user|
        sheet.add_row([
          user.id,
          user.first_name,
          user.last_name,
          user.email,
          user.created_at&.strftime('%Y-%m-%d %H:%M:%S'),
          user.confirmed_at&.strftime('%Y-%m-%d %H:%M:%S'),
          user.organization&.name,
          user.referral_code
        ])
      end
      
      # Set column widths manually since auto_width doesn't exist
      sheet.column_widths 10, 15, 15, 30, 20, 20, 20, 15
    end
    
    # Save file
    package.serialize(file_path.to_s)
    
    file_path.to_s
  end
end 
namespace :reports do
  desc "Generate and send daily user report (for testing)"
  task daily_user_report: :environment do
    puts "Generating daily user report..."
    DailyUserReportJob.perform_now
    puts "Daily user report completed!"
  end

  desc "Generate and send daily user report for a specific date"
  task :daily_user_report_for_date, [:date] => :environment do |task, args|
    date = args[:date] ? Date.parse(args[:date]) : Date.current
    puts "Generating daily user report for #{date}..."
    
    # Temporarily override Date.current for the job
    Date.stub(:current, date) do
      DailyUserReportJob.perform_now
    end
    
    puts "Daily user report for #{date} completed!"
  end
end 
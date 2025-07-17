class ContactMailer < ApplicationMailer
    default to: ENV['SMTP_USER_NAME'], from: ENV['SMTP_USER_NAME']
  
    def notify_admin
      @name = params[:name]
      @email = params[:email]
      @message = params[:message]
      @mobile = params[:mobile]
  
      mail(subject: "New Contact Message from #{@name}")
    end
      
end
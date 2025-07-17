# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  default from: ENV['SMTP_USER_NAME']

  def login_notification(user)
    @user = user
    mail(to: @user.email, subject: 'Login Notification')
  end

  def detailed_login_notification(user, ip_address, location)
    @user = user
    @ip_address = ip_address
    @location = location
    @login_time = Time.current.in_time_zone('Asia/Kolkata').strftime('%d-%b-%Y %I:%M %p') # IST formatted

    mail(to: @user.email, subject: "✅ Login Successful - Welcome Back to TalentTest!")
  end

  def password_confirmation_email(user)
    @user = user
    mail(to: @user.email, subject: 'Your password has been successfully updated')
  end

  def notify_admin_of_login(user)
    @user = user
    mail(to: ENV['SUPPORT_EMAIL'], subject: "User Login Alert: #{@user.email} has logged in")
  end

  def notify_admin_of_new_user(user)
    @user = user
    admin_emails = [
      ENV['SUPPORT_EMAIL'],
      ENV['OTHER_CC_EMAIL'].split(',')
    ].flatten.compact.uniq
    mail(
      to: admin_emails,
      subject: "🎉 New User Registration: #{@user.email}"
    )
  end

  def purchase_success_email(user, tokens, invoice)
    @user = user
    @tokens = tokens
    @invoice = invoice

    pdf_html = render_to_string(
      template: "api/v1/invoices/show",
      layout: "pdf", # or false
      assigns: { invoice: @invoice }
    )
    pdf = WickedPdf.new.pdf_from_string(pdf_html)

    attachments["Invoice_#{@invoice.invoice_number}.pdf"] = {
      mime_type: 'application/pdf',
      content: pdf
    }

    mail(
      to: @user.email,
      subject: "Your Token Purchase was Successful"
    )
  end

  def notify_admin_of_purchase(user, tokens, invoice)
    @user = user
    @tokens = tokens
    @invoice = invoice
 admin_emails = [
      ENV['SUPPORT_EMAIL'],
      ENV['OTHER_CC_EMAIL'].split(',')
    ].flatten.compact.uniq
    mail(
      to: admin_emails,
      subject: "A User Purchased Tokens"
    )
  end

  def excel_upload_success(user, file_name)
    @user = user
    @file_name = file_name
    mail(to: @user.email, subject: "Your Excel file was processed successfully")
  end

  def excel_upload_failure(user, file_name, errors)
    @user = user
    @file_name = file_name
    @errors = errors
    mail(to: @user.email, subject: "Issue with your Excel file upload")
  end

  def referral_success_email(referrer, referred_user)
    @referrer = referrer
    @referred_user = referred_user
    mail(
      to: @referrer.email,
      subject: "🎉 Someone used your referral code!"
    )
  end

  def referral_bonus_email(user, amount)
    @user = user
    @amount = amount
    mail(
      to: @user.email,
      subject: "💰 You've received a referral bonus of ₹#{@amount}!"
      )
  end

  def referral_invitation(referrer, recipient_email)
    @referrer = referrer
    @referral_link = "#{ENV['FRONTEND_URL']}/signup?referral=#{referrer.referral_code}"

    mail(
      to: recipient_email,
      subject: "#{@referrer.name} invited you to join TestPortal!"
    )
  end
end

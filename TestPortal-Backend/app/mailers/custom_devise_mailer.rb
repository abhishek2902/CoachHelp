# app/mailers/custom_devise_mailer.rb
class CustomDeviseMailer < Devise::Mailer
  default from: ENV['SMTP_USER_NAME']
  default reply_to: nil

  def headers_for(action, opts)
    super.merge(reply_to: nil) # force remove
  end

  default template_path: 'devise/mailer' # use devise mailer templates

  def reset_password_instructions(record, token, opts = {})
    @token = token # ✅ make token available in the template
    opts[:subject] ||= I18n.t('devise.mailer.reset_password_instructions.subject')

    # You can still generate the frontend URL if you want to show it in plain-text emails
    opts[:reset_password_url] = "#{ENV['FRONTEND_URL']}/reset-password?reset_password_token=#{token}"

    super
  end

  def confirmation_instructions(record, token, opts = {})
    @token = token
    devise_mail(record, :confirmation_instructions, opts)
  end
end

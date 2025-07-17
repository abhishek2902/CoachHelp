class UserMailerJob < ApplicationJob
  queue_as :mailers

  def perform(mail_type, user_id, ip_address = nil, location = nil)
    user = User.find(user_id)

    case mail_type
    when "login_notification"
      UserMailer.login_notification(user).deliver_later

    # when "notify_admin_of_login"
    #   UserMailer.notify_admin_of_login(user).deliver_later

    # when "password_confirmation"
    #   UserMailer.password_confirmation_email(user).deliver_later

    when "detailed_login_notification"
      UserMailer.detailed_login_notification(user, ip_address, location).deliver_later
    end
  end
end

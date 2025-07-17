class TrackUserLoginJob < ApplicationJob
  queue_as :default

  def perform(user_id, ip_address)
    user = User.find(user_id)
    location = Geocoder.search(ip_address).first&.city || "Unknown"

    unless user.login_notified?
      UserMailerJob.perform_later("login_notification", user.id)
      user.update(login_notified: true)
    end

    if user.login_email_required?
      UserMailerJob.perform_later("detailed_login_notification", user.id, ip_address, location)
    end

    # UserMailerJob.perform_later("notify_admin_of_login", user.id)

    Notification.create!(
      user: user,
      message: "You have logged in successfully. #{Time.current.in_time_zone('Asia/Kolkata').strftime('%d-%b-%Y %I:%M %p')}",
      notifiable: user
    )
  end
end

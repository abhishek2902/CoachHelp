Sentry.init do |config|
  config.dsn = ENV['SENTRY_DSN']
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]
  config.traces_sample_rate = 0.2 # 0.0 to 1.0, for performance monitoring
  config.environment = Rails.env

  # Capture user context (optional)
  config.before_send = lambda do |event, hint|
    if defined?(Current) && Current.user
      event.set_user(id: Current.user.id, email: Current.user.email)
    end
    event
  end
end

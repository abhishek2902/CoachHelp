Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", "redis://127.0.0.1:6379/0") }
  
  # Configure sidekiq-scheduler
  config.on(:startup) do
    Sidekiq.schedule = YAML.load_file(File.expand_path('../../sidekiq_schedule.yml', __FILE__)) if File.exist?(File.expand_path('../../sidekiq_schedule.yml', __FILE__))
    Sidekiq::Scheduler.reload_schedule!
  end
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch("REDIS_URL", "redis://127.0.0.1:6379/0") }
end


Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins '*'  # OR use 'http://localhost:5173' for Vite/React frontend
  
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        expose: ['access-token', 'expiry', 'token-type', 'Authorization']
    end
  end
  
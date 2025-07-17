OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.silence_get_warning = true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, 
          ENV['GOOGLE_OAUTH_CLIENT_ID'],
          ENV['GOOGLE_OAUTH_CLIENT_SECRET'],
          {
            name: 'google',
            scope: 'email,profile',
            prompt: 'select_account',
            image_aspect_ratio: 'square',
            image_size: 50,
            access_type: 'offline',
            origin_param: 'return_to'
          }
end

ENV['SSL_CERT_FILE'] = '/etc/ssl/certs/ca-certificates.crt'


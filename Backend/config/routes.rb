require 'sidekiq/web'
Rails.application.routes.draw do

  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    ActiveSupport::SecurityUtils.secure_compare(username, ENV.fetch("SIDEKIQ_USERNAME")) &
    ActiveSupport::SecurityUtils.secure_compare(password, ENV.fetch("SIDEKIQ_PASSWORD"))
  end

  mount Sidekiq::Web => '/sidekiq'

  # Sitemap routes (must be before other routes to avoid conflicts)
  get 'sitemap.xml', to: 'sitemap#index', defaults: { format: 'xml' }
  get 'sitemap_index.xml', to: 'sitemap#index_xml', defaults: { format: 'xml' }
  post 'sitemap/regenerate', to: 'sitemap#regenerate'

  devise_scope :user do
    post 'refresh_token', to: 'users/sessions#refresh'
  end

  namespace :admin do
    resources :users, only: [:index, :destroy, :update, :create] do
      member do
        post :upload_profile_picture
      end
    end
    resources :tests, only: [:index, :update, :destroy, :show]
    resources :questions, only: [:index, :update, :destroy, :show]
    resources :plans
    resources :reviews, param: :slug
    resources :dynamic_pages, param: :slug
    resources :helps do
      collection do
        post :reorder
      end
    end
    resources :promo_codes
    get 'analytics/stats', to: 'analytics#status'
    get "analytics/my_stats", to: "analytics#my_stats"
    post 'analytics/trigger_daily_report', to: 'analytics#trigger_daily_report'
    # resources :analytics
    delete 'account', to: 'users#destroy_current'
    resources :organizations do
      member do
        post :upload_image
      end
    end
    resources :trainings
  end

  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  root to: redirect('/admin')
  devise_for :admin_users, path: 'admin_users', controllers: {
    sessions: 'admin_users/sessions'
  }
  devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'signup'
  },
  controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    confirmations: 'users/confirmations',
    omniauth_callbacks: 'users/omniauth_callbacks',
    passwords: 'users/passwords'
  }

  get 'users/confirmation_status', to: 'users/confirmations#status'

  namespace :api do
    namespace :v1 do

      resources :test_domains do
        resources :categories, shallow: true do
          collection do
            get :final_categories
          end
          member do
            post :clone
          end
          resources :master_questions, only: [:index, :create]
        end
      end
      resources :face_detection_screenshots, only: [:create]
      resources :users, only: [:update]
      get 'tests/by_code', to: 'tests#find_by_code'
      post 'users/generate_referral_code', to: 'users#generate_referral_code'
      post 'users/share_referral_invitation', to: 'users#share_referral_invitation'

      resources :tests_process do
        post :upload_file, on: :collection
      end
      resources :analytics do
        collection do
          get :my_status
        end
      end
      resources :tests do
        collection do
          get :export_csv
          get "export_download", to: "tests#export_download"
          post :upload_excel
          get :total_count
          post :bulk_delete
        end
        member do
          get :access_check
          patch :unpublish
          post :generate_link
          post :share
          post :upload_candidates_excel
          get :download_candidates_template
          post :clone_category
          post :clone_category_section
        end

         get 'shared_tests/:token', to: 'shared_tests#show'
         post 'shared_tests/:token/start', to: 'shared_tests#start'

        resources :sections, only: [:create, :update, :destroy] do
          resources :questions, only: [:create, :update, :destroy]
        end
      end

      resources :plans, only: [:index, :show] do
        collection do
          get :index_for_current_user
        end
      end
      resources :subscriptions
      resources :contacts do
        member do
          patch :resolve  # To mark a message as resolved
          delete :destroy # To delete a message
          get :confirmation_status
        end
      end
      resources :faqs
      resources :dynamic_pages, only: [:show]

      resources :questions, only: [:index, :show, :update, :destroy]

      resource :accounts, only: [:update] do
        collection do
          get :give
          put :upload_profile_picture
          get :referral
          get :all_referrals
        end
      end

      resources :invoices, only: [:show, :index, :create]

      resources :test_attempts do
        resource :feedbacks, only: [:create]
        collection do
          get 'by_test/:id', to: 'test_attempts#by_test'
          get 'show_attempt_details/:id', to: 'test_attempts#show_attempt_details'
          get :test_attempts_list
        end
        member do
          get :dashboard
          post :send_otp
          post :verify_otp
          post :start_test
          get :attempt_details
          post :send_response_email
          get :coding_test_state
        end
      end

      resources :notifications, only: [:index, :destroy] do
        collection do
          get :unread_count
          put :mark_as_read
          delete :clear_all
        end
      end

      resources :razorpay, only: [] do
        collection do
          post 'create_order', to: 'razorpay#create_order'
          post 'verify_payment', to: 'razorpay#verify_payment'
        end
      end

      resources :sections, only: [:index, :create]
      resources :attachments, only: [:create]
      resources :coding_tests, only: [:show, :create, :update, :destroy] do
        member do
          post :submit_solution
          get :submissions
          get :submission_status
        end
      end
      


      # Result AI Chat routes
      post 'result_ai_chat', to: 'result_ai_chat#create'
      post 'result_ai_chat/reset', to: 'result_ai_chat#reset'
      post 'result_ai_chat/sync', to: 'result_ai_chat#sync'
      post 'result_ai_chat/find_or_create', to: 'result_ai_chat#find_or_create'

      resources :conversations, only: [:index, :show, :create]
      resources :user_wallets, only: [:index, :show]
      resources :token_transactions, only: [:index, :show]

      post 'tokens/purchase', to: 'tokens#purchase'

      resources :organizations, only: [:index]

      # Google authentication
      post 'auth/google', to: 'auth#google'

      # GitHub authentication
      post 'auth/github', to: 'auth#github'

      # Currency conversion
      get 'currency/detect', to: 'currency#detect_currency'
      get 'currency/convert', to: 'currency#convert_price'
      get 'currency/rate', to: 'currency#get_exchange_rate'

      resources :ai_chat, only: [:create] do
        collection do
          post :reset
          post :find_or_create
          get :conversations
          get :conversation_state
          post :upload_json_file
          get :export_test_json
          post :soft_delete_all
        end
      end

      # AI Conversation Controller - Separate from ai_chat for better conversation management
      resources :ai_conversation, only: [:update] do
        collection do
          get :conversations
          get :conversation_state
          post :reset
          post :find_or_create
          post :soft_delete_all
          post :restore_all
          delete :permanent_delete_all
          post :upload_file
        end
        member do
          post :soft_delete
          post :restore
          delete :permanent_delete
          post :save_draft
          post :ai_task, to: 'ai_conversation#create_ai_task'
          get :ai_tasks, to: 'ai_conversation#list_ai_tasks'
        end
      end

      post 'ai_tasks/:id/cancel', to: 'ai_conversation#cancel_ai_task'

      # AI Mock Test Generation routes
      resources :ai_mock_tests, only: [] do
        collection do
          get :leaf_categories
          get :recent_tests
          get :test_api
          post :generate_all
          post :generate_category
          get :status_summary
        end
      end

      get 'ai_tasks/:id', to: 'ai_conversation#show_ai_task'

      post 'ai_conversation', to: 'ai_conversation#create'

      resources :result_ai_chat, only: [:create] do
        collection do
          post :reset
          post :sync
        end
      end

      resources :categories, param: :id do
        resources :master_questions, only: [:index, :create]
        post :clone, on: :member
      end

      # AI Mock Test Generation routes
      resources :ai_mock_tests, only: [] do
        collection do
          post :generate_all
          get :leaf_categories
          get :status
          get :test_api
        end
        member do
          post :generate_for_category
        end
      end

      get 'trainings/enrolled', to: 'trainings#enrolled'
      get 'trainings/by_code/:code', to: 'trainings#by_code'
      # resources :trainings, only: [:create, :show, :index, :update, :destroy]
      resources :trainings do
        member do
          get :access_check
          patch :unpublish
          post :generate_link
          post :share
          post :upload_candidates_excel
          get :download_candidates_template
        end
      end

      get 'training_enrollments/enrolled', to: 'training_enrollments#enrolled'
      get 'training_enrollments/by_training/:id', to: 'training_enrollments#by_training'
      get 'training_enrollments/attempt/:id', to: 'training_enrollments#attempt'
      post 'training_enrollments/enroll', to: 'training_enrollments#enroll'
      resources :training_enrollments, only: [] do
        member do
          put :submit
          put :save
        end
        collection do
          get :training_attempts_list
        end
      end

    end
  end

  namespace :admin do
    resources :users, only: [:index, :destroy]
    resources :tests, only: [:index, :update, :destroy, :show]
    resources :questions, only: [:index, :update, :destroy, :show]
    resources :plans
    get 'analytics/status', to: 'analytics#status'
    get "analytics/my_status", to: "analytics#my_status"
    # resources :analytics
    delete 'account', to: 'users#destroy_current'
  end

  resources :helps, only: [:index, :show]

  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end
end

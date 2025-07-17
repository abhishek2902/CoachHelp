class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable,
  :registerable,
  :recoverable,
  :rememberable,
  :validatable,
  :jwt_authenticatable,
  :omniauthable,
  :confirmable,
  jwt_revocation_strategy: self,
  omniauth_providers: [:google_oauth2]

  has_many :tests, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :subscriptions, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :invoices, dependent: :destroy
  # 1. The referral record *about* this user (i.e., if they used someone else's code)
  has_one :referral, dependent: :destroy

  # 2. The user who referred *this* user (via referral.referred_by_code → user's referral_code)
  has_one :referrer_user, through: :referral, source: :referrer_user

  # 3. The list of referral records where *others* used this user's code
  has_many :referrals_sents, class_name: 'Referral',
                             foreign_key: 'referred_by_code',
                             primary_key: 'referral_code'
  has_many :referral_email_log, dependent: :destroy
  has_one :user_wallet, dependent: :destroy
  belongs_to :organization, optional: true
  has_one :review, dependent: :destroy
  has_many :conversations, dependent: :destroy
  has_many :token_transactions, dependent: :destroy

    # Trainings created by the user (creator)
  has_many :trainings, dependent: :destroy

  # Enrollments to trainings
  has_many :training_enrollments, dependent: :destroy

  # Trainings the user is enrolled in (as a learner)
  has_many :enrolled_trainings, through: :training_enrollments, source: :training

  has_one_attached :profile_picture

  validates :first_name, presence: true

  # Automatically create wallet with 100 tokens for new users
  after_create :create_wallet_with_tokens

  def active_subscription
    subscriptions.find_by(status: "active")
  end

  def tests_remaining
    active_subscription&.tests_remaining || 0
  end

  def active_subscription_status
    active_subscription.present?
  end

  def name
    "#{self.first_name} #{self.last_name}"
  end

  def profile_picture_url
    profile_picture.attached? ? Rails.application.routes.url_helpers.url_for(profile_picture) : nil
  end

  def self.from_omniauth(access_token)
    data = access_token.info
    user = User.where(email: data['email']).first

    unless user
      user = User.create(
        email: data['email'],
        password: Devise.friendly_token[0, 20],
        first_name: data['first_name'],
        last_name: data['last_name'],
        confirmed_at: Time.current,
        # Add more user fields if needed from access_token.extra.raw_info
        )
      
      # Send admin notification for new user registration
      UserMailer.notify_admin_of_new_user(user).deliver_later
    else
      # Ensure existing OAuth users have a wallet (for users created before wallet feature)
      user.create_wallet_with_tokens if user.user_wallet.nil?
    end
    user
  end

  def create_wallet_with_tokens
    # Prevent duplicate wallet creation
    return if user_wallet.present?
    
    # Create wallet with 100 tokens for new users
    wallet = UserWallet.create!(
      user: self,
      token_balance: 100
    )
    
    # Create a token transaction record for the initial tokens
    TokenTransaction.create!(
      user: self,
      amount: 100,
      source: 'signup_bonus',
      meta: { note: 'Welcome bonus tokens for new user signup' }
    )
    
    Rails.logger.info "Created wallet with 100 tokens for user #{self.email} (ID: #{self.id})"
  rescue => e
    Rails.logger.error "Failed to create wallet for user #{self.email}: #{e.message}"
    # Don't fail user creation if wallet creation fails
  end

  private
end

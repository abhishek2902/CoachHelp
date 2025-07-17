class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :first_name, :last_name, :admin, :profile_picture_url, :active_subscription_status, :tests_remaining
end 
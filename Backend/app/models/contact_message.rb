class ContactMessage < ApplicationRecord
    validates :name, :email, :message, :mobile, presence: true
end
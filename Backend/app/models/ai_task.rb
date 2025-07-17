class AiTask < ApplicationRecord
  enum status: { pending: 0, processing: 1, done: 2, failed: 3, cancelled: 4 }
  belongs_to :conversation
  belongs_to :user
  belongs_to :parent, class_name: 'AiTask', optional: true
  has_many :children, class_name: 'AiTask', foreign_key: :parent_id
end

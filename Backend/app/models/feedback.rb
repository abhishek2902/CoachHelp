class Feedback < ApplicationRecord
  belongs_to :test_attempt

  validates :rating, inclusion: { in: 1..5 }
end

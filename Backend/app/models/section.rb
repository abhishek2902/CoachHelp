class Section < ApplicationRecord
  belongs_to :test
  # has_many :questions, dependent: :destroy
  has_many :questions, -> { order(id: :asc) }, dependent: :destroy
  has_many :coding_tests, dependent: :destroy

  accepts_nested_attributes_for :questions, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :coding_tests, allow_destroy: true, reject_if: :all_blank
end

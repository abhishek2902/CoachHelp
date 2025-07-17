class Question < ApplicationRecord
  belongs_to :section
  belongs_to :test, optional: true
  # has_one_attached :figure
  # accepts_nested_attributes_for :questions

  # validates :content, :correct_option, :marks, presence: true

  before_save :set_test_id_from_section

  validates :content, :marks, presence: true, if: -> { section&.test&.status == 'published' }

  def set_test_id_from_section
    self.test_id = section.test_id if section
  end
end

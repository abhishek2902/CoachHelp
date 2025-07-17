class Category < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged
  belongs_to :test_domain
  belongs_to :parent, class_name: 'Category', optional: true
  has_many :children, class_name: 'Category', foreign_key: 'parent_id', dependent: :destroy
  has_many :master_questions, dependent: :destroy
  validates  :name, presence: true

  # Scope to find all leaf categories (categories with no children)
  scope :leaf_categories, -> { left_joins(:children).where(children_categories: { id: nil }) }

  def all_descendant_master_questions
    master_questions + children.flat_map(&:all_descendant_master_questions)
  end

  # Check if this category is a leaf node (has no children)
  def leaf?
    children.empty?
  end

  # Check if this category is a final category (leaf node with questions)
  def final?
    leaf? && master_questions.any?
  end

  # Get the depth level of this category in the hierarchy
  def depth
    return 0 if parent.nil?
    parent.depth + 1
  end

  # Get all ancestor categories
  def ancestors
    return [] if parent.nil?
    [parent] + parent.ancestors
  end

  # Get the full path of this category
  def full_path
    ancestors.reverse + [self]
  end
end

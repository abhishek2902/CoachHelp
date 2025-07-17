class AddTitleAndShowInPublicToReviews < ActiveRecord::Migration[7.1]
  def change
    add_column :reviews, :title, :string
    add_column :reviews, :show_in_public, :boolean
  end
end

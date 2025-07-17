class AddResolvedToContactMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :contact_messages, :resolved, :boolean, default: false
  end
end

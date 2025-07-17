class AddDeletedAtToConversations < ActiveRecord::Migration[7.1]
  def change
    add_column :conversations, :deleted_at, :datetime
    add_index :conversations, :deleted_at
  end
end

class AddDeletedAtToChatMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :chat_messages, :deleted_at, :datetime
    add_index :chat_messages, :deleted_at
  end
end

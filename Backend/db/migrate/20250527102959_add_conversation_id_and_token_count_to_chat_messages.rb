class AddConversationIdAndTokenCountToChatMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :chat_messages, :conversation_id, :integer
    add_column :chat_messages, :token_count, :integer
  end
end

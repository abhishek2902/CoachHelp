class AddConversationTypeToConversations < ActiveRecord::Migration[7.1]
  def change
    add_column :conversations, :conversation_type, :string
  end
end 
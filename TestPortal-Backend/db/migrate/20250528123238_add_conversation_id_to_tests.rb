class AddConversationIdToTests < ActiveRecord::Migration[7.1]
  def change
    add_column :tests, :conversation_id, :integer
  end
end

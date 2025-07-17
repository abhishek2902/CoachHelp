class AddContextDataToConversations < ActiveRecord::Migration[7.1]
  def change
    add_column :conversations, :context_data, :text
  end
end

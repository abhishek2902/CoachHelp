class AddAiTaskIdsToChatMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :chat_messages, :ai_task_ids, :jsonb, default: []
  end
end 
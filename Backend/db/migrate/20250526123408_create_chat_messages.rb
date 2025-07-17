class CreateChatMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :chat_messages do |t|
      t.integer :user_id
      t.text :user_message
      t.text :bot_reply

      t.timestamps
    end
  end
end

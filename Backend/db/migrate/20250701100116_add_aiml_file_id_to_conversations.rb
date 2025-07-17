class AddAimlFileIdToConversations < ActiveRecord::Migration[7.1]
  def change
    add_column :conversations, :aiml_file_id, :string
  end
end

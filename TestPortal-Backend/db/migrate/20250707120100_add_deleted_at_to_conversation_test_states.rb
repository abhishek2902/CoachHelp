class AddDeletedAtToConversationTestStates < ActiveRecord::Migration[7.1]
  def change
    add_column :conversation_test_states, :deleted_at, :datetime
    add_index :conversation_test_states, :deleted_at
  end
end

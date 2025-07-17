class CreateConversationTestStates < ActiveRecord::Migration[7.0]
  def change
    # create_table :conversation_test_states do |t|
    #   t.references :conversation, null: false, foreign_key: true
    #   t.references :user, null: false, foreign_key: true
    #   t.json :test_state, default: {}
    #   t.timestamps
    # end

    # add_index :conversation_test_states, [:conversation_id, :user_id], unique: true
  end
end 
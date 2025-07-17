class MakeConversationIdNullableInTokenTransactions < ActiveRecord::Migration[7.1]
  def change
    change_column_null :token_transactions, :conversation_id, true
  end
end

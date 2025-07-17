class ChangeTokenTransactionsConversationFkToSetNull < ActiveRecord::Migration[6.0]
  def change
    remove_foreign_key :token_transactions, :conversations
    add_foreign_key :token_transactions, :conversations, on_delete: :nullify
  end
end
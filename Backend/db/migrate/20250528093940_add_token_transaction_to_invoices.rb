class AddTokenTransactionToInvoices < ActiveRecord::Migration[7.1]
  def change
    add_column :invoices, :token_transaction_id, :integer
  end
end

class AddUserToInvoices < ActiveRecord::Migration[7.1]
  def change
    add_reference :invoices, :user, null: true, foreign_key: true
  end
end

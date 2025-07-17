class MakeSubscriptionIdNullableInInvoices < ActiveRecord::Migration[7.1]
  def change
    change_column_null :invoices, :subscription_id, true
  end
end

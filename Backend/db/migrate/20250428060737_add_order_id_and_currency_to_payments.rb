class AddOrderIdAndCurrencyToPayments < ActiveRecord::Migration[7.1]
  def change
    add_column :payments, :order_id, :string
    add_column :payments, :currency, :string
  end
end

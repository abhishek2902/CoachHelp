class AddCurrencyFieldsToInvoices < ActiveRecord::Migration[7.1]
  def change
    # add_column :invoices, :currency, :string, default: 'INR'
    # add_column :invoices, :converted_amount, :decimal, precision: 10, scale: 2
    # add_column :invoices, :exchange_rate, :decimal, precision: 10, scale: 6
    # add_column :invoices, :original_currency, :string, default: 'INR'
    # add_column :invoices, :original_amount, :decimal, precision: 10, scale: 2
  end
end 
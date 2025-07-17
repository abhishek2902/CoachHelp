class AddInvoiceAmountFields < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :base_amount, :decimal, precision: 10, scale: 2, default: 0
    add_column :invoices, :discounted_amount, :decimal, precision: 10, scale: 2, default: 0
    add_column :invoices, :gst_amount, :decimal, precision: 10, scale: 2, default: 0
    add_column :invoices, :total_amount, :decimal, precision: 10, scale: 2, default: 0
    add_column :invoices, :currency, :string
  end
end 
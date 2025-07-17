class AddDiscountToInvoices < ActiveRecord::Migration[6.1]  # or your Rails version
  def change
    add_column :invoices, :discount, :integer, default: 0
  end
end

class CreateInvoices < ActiveRecord::Migration[7.1]
  def change
    create_table :invoices do |t|
      t.references :subscription, null: false, foreign_key: true
      t.decimal :amount
      t.string :payment_id
      t.string :invoice_number
      t.string :status
      t.datetime :issued_at
      t.string :user_name
      t.string :user_email
      t.string :user_phone

      t.timestamps
    end
  end
end

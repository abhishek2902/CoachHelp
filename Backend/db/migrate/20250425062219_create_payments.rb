class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :subscription, null: false, foreign_key: true
      t.decimal :amount
      t.string :status
      t.string :transaction_id
      t.string :payment_gateway
      t.datetime :paid_at

      t.timestamps
    end
  end
end

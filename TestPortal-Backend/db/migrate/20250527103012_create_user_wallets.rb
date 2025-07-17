class CreateUserWallets < ActiveRecord::Migration[7.1]
  def change
    create_table :user_wallets do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :token_balance

      t.timestamps
    end
  end
end

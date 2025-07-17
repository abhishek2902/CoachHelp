class CreateTokenTransactions < ActiveRecord::Migration[7.1]
  def change
    create_table :token_transactions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :conversation, null: false, foreign_key: true
      t.integer :amount
      t.string :source
      t.jsonb :meta

      t.timestamps
    end
  end
end

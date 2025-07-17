class CreatePromoCodes < ActiveRecord::Migration[7.1]
  def change
    create_table :promo_codes do |t|
      t.string :code
      t.integer :discount
      t.datetime :expires_at
      t.boolean :active
      t.integer :usage_limit
      t.integer :usage_count

      t.timestamps
    end
  end
end

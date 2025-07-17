class CreateSubscriptions < ActiveRecord::Migration[7.1]
  def change
    create_table :subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :plan, null: false, foreign_key: true
      t.string :status
      t.datetime :start_date
      t.datetime :end_date
      t.string :payment_method
      t.string :external_payment_id
      t.boolean :cancel_at_period_end

      t.timestamps
    end
  end
end

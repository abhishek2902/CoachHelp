class AddOrderIdToSubscriptions < ActiveRecord::Migration[7.1]
  def change
    add_column :subscriptions, :order_id, :string
  end
end

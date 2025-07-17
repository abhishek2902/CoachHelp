class AddFreePlanUsedToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :free_plan_used, :boolean, default: false, null: false
  end
end

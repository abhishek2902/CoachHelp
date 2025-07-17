class AddIsOneTimeUseToPlans < ActiveRecord::Migration[6.1]
  def change
    add_column :plans, :is_one_time_use, :boolean, default: false, null: false
  end
end

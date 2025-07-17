class AddFieldsToPlansAndSubscriptions < ActiveRecord::Migration[7.1]
  def change
    # Add columns to plans
    add_column :plans, :tests_allowed, :integer, default: 0
    add_column :plans, :currency, :string, default: "INR"

    # Add columns to subscriptions
    add_column :subscriptions, :tests_allowed, :integer, default: 0
    add_column :subscriptions, :tests_remaining, :integer, default: 0
  end
end

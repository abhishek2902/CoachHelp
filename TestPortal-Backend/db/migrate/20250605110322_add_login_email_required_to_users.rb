class AddLoginEmailRequiredToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :login_email_required, :boolean, default: false
  end
end

class AddLoginNotifiedToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :login_notified, :boolean, default: false
  end
end

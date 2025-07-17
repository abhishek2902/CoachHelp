class AddGstNumberToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :gst_number, :string
  end
end

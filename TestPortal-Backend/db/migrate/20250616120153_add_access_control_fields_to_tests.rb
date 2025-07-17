class AddAccessControlFieldsToTests < ActiveRecord::Migration[7.1]
  def change
    add_column :tests, :link_expires_date, :date
    add_column :tests, :access_start_time, :datetime
    add_column :tests, :access_end_time, :datetime
  end
end

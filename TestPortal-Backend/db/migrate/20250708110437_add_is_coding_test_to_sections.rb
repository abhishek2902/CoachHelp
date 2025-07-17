class AddIsCodingTestToSections < ActiveRecord::Migration[7.1]
  def change
    add_column :sections, :is_coding_test, :boolean, default: false
  end
end

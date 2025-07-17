class AddDurationToSections < ActiveRecord::Migration[7.1]
  def change
    add_column :sections, :duration, :integer
  end
end

class AddDescriptionToOrganizations < ActiveRecord::Migration[7.1]
  def change
    add_column :organizations, :description, :string
  end
end

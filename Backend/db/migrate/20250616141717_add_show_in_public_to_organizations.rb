class AddShowInPublicToOrganizations < ActiveRecord::Migration[7.1]
  def change
    add_column :organizations, :show_in_public, :boolean
  end
end

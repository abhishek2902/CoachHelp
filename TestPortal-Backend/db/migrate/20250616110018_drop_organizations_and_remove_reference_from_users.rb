class DropOrganizationsAndRemoveReferenceFromUsers < ActiveRecord::Migration[7.1]
  def change
    remove_reference :users, :organization, foreign_key: true if column_exists?(:users, :organization_id)
    drop_table :organizations, if_exists: true
  end
end

class CreateOrganizationsAndAddToUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :organizations do |t|
      t.string :name

      t.timestamps
    end

    add_reference :users, :organization, null: true, foreign_key: { on_delete: :nullify }
  end
end

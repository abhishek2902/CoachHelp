class CreateContactMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :contact_messages do |t|
      t.string :name
      t.string :email
      t.text :message
      t.string :mobile

      t.timestamps
    end
  end
end

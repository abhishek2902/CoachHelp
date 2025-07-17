class CreatePlans < ActiveRecord::Migration[7.1]
  def change
    create_table :plans do |t|
      t.string :name
      t.decimal :price
      t.string :interval
      t.text :description
      t.text :features
      t.boolean :active

      t.timestamps
    end
  end
end

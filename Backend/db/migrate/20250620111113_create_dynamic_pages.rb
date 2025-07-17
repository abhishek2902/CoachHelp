class CreateDynamicPages < ActiveRecord::Migration[7.1]
  def change
    create_table :dynamic_pages do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :content
      t.string :meta_description
      t.string :og_title
      t.string :og_description
      t.string :og_image
      t.string :canonical_url
      t.string :price
      t.string :currency, default: 'INR'
      t.boolean :active, default: true
      t.json :schema_data

      t.timestamps
    end
    add_index :dynamic_pages, :slug, unique: true
    add_index :dynamic_pages, :active
  end
end 
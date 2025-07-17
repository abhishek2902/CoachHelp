class CreateHelps < ActiveRecord::Migration[7.0]
  def change
    create_table :helps do |t|
      t.string :title, null: false
      t.text :description
      t.string :video_url
      t.string :slug, null: false
      t.integer :position, default: 0
      t.timestamps
    end
    add_index :helps, :slug, unique: true
    add_index :helps, :position
  end
end 
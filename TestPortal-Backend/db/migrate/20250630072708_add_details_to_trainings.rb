class AddDetailsToTrainings < ActiveRecord::Migration[7.1]
  def change
    add_column :trainings, :total_marks, :integer
    add_column :trainings, :slug, :string
    add_column :trainings, :link_expires_date, :date
    add_index :trainings, :slug, unique: true, name: "index_trainings_on_slug"
  end
end

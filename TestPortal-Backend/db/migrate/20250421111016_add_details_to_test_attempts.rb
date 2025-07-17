class AddDetailsToTestAttempts < ActiveRecord::Migration[7.1]
  def change
    change_table :test_attempts do |t|
      t.string :name
      t.string :email
      t.string :mobile
      t.string :institute
      t.datetime :start_at
      t.datetime :end_at
      t.integer :marks
    end
  end
end

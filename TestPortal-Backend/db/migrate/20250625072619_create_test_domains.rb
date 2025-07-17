class CreateTestDomains < ActiveRecord::Migration[7.1]
  def change
    create_table :test_domains do |t|
      t.string :name

      t.timestamps
    end
    add_index :test_domains, :name
  end
end

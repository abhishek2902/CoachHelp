class CreateFaqs < ActiveRecord::Migration[7.1]
  def change
    create_table :faqs do |t|
      t.string :question
      t.text :answer
      t.string :tags

      t.timestamps
    end
  end
end

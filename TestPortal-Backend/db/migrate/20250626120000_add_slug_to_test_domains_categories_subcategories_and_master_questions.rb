class AddSlugToTestDomainsCategoriesSubcategoriesAndMasterQuestions < ActiveRecord::Migration[7.1]
  def change
    add_column :test_domains, :slug, :string
    add_index :test_domains, :slug, unique: true

    add_column :categories, :slug, :string
    add_index :categories, :slug, unique: true

    add_column :subcategories, :slug, :string
    add_index :subcategories, :slug, unique: true

    add_column :master_questions, :slug, :string
    add_index :master_questions, :slug, unique: true
  end
end
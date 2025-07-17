class AddContentHtmlToTrainingSections < ActiveRecord::Migration[7.1]
  def change
    add_column :training_sections, :content_html, :text
  end
end

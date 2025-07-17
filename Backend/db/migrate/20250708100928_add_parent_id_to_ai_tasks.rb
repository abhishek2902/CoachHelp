class AddParentIdToAiTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :ai_tasks, :parent_id, :integer
  end
end

class MakeTestIdNullableInConversations < ActiveRecord::Migration[7.1]
  def change
    change_column_null :conversations, :test_id, true
  end
end

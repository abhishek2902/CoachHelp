class UpdateCodingTestDifficulties < ActiveRecord::Migration[7.1]
  def up
    # Update existing difficulty values from old enum to new enum
    # low (0) -> easy (0) - no change needed
    # medium (1) -> medium (1) - no change needed  
    # high (2) -> hard (2) - no change needed
    
    # Since the integer values are the same, we don't need to update the data
    # Just ensuring the enum mapping is correct
  end

  def down
    # No rollback needed since we're not changing the integer values
  end
end

class Conversation < ApplicationRecord
  acts_as_paranoid
  belongs_to :user
  belongs_to :test, optional: true
  has_many :chat_messages, dependent: :destroy
  has_one :conversation_test_state, dependent: :destroy
  has_many :token_transactions # No dependent option, always keep transactions
  has_many :ai_tasks

  validates :user_id, presence: true

  def really_destroy!
    chat_messages.with_deleted.each(&:really_destroy!)
    # Hard delete all associated ConversationTestState records (even soft deleted)
    ConversationTestState.with_deleted.where(conversation_id: id).each(&:really_destroy!)
    super
  end

  # Custom restore method that also restores associated data
  def restore_with_associations!
    # First restore the conversation itself
    restore!
    
    # Then restore all associated chat messages
    chat_messages.only_deleted.each(&:restore!)
    
    # Then restore the conversation test state if it exists
    conversation_test_state&.restore! if conversation_test_state&.deleted?
    
    # Also check for any ConversationTestState that might not be loaded
    ConversationTestState.only_deleted.where(conversation_id: id).each(&:restore!)
  end
end

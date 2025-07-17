import React from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Clock, 
  Grid3X3, 
  List,
  Star,
  Archive,
  Copy,
  Share2,
  RotateCcw,
  Edit3,
  Check,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';

const ConversationList = ({
  conversations,
  selectedId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearAll,
  searchQuery,
  onSearchChange,
  conversationMenuOpen,
  onConversationMenuToggle,
  isMobile,
  onMobileToggle,
  isTrashView = false,
  onRestoreConversation,
  onPermanentDelete,
  onRestoreAll,
  onPermanentDeleteAll,
  onUpdateConversationTitle,
  tourEnabled = false
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    const title = String(conv.testTitle || '').toLowerCase();
    const lastMessage = typeof conv.lastMessage === 'string' 
      ? conv.lastMessage.toLowerCase() 
      : String(conv.lastMessage || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    
    return title.includes(query) || lastMessage.includes(query);
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  // Get conversation preview text
  const getConversationPreview = (conv) => {
    if (!conv.messages || conv.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = conv.messages[conv.messages.length - 1];
    
    // Handle different types of lastMessage
    let text = '';
    if (typeof lastMessage === 'string') {
      text = lastMessage;
    } else if (typeof lastMessage === 'object' && lastMessage !== null) {
      text = lastMessage.text || lastMessage.message || lastMessage.reply || JSON.stringify(lastMessage);
    } else {
      text = String(lastMessage || '');
    }
    
    // Ensure text is a string and truncate if needed
    const safeText = String(text);
    return safeText.length > 50 ? safeText.substring(0, 50) + '...' : safeText;
  };

  // Get message count
  const getMessageCount = (conv) => {
    if (!conv.messages || !Array.isArray(conv.messages)) return 0;
    return conv.messages.length;
  };

  // Handle copy conversation link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/ai-conversation?id=${selectedId}`;
    navigator.clipboard.writeText(link).then(() => {
      Swal.fire('Copied!', 'Conversation link copied to clipboard.', 'success');
    });
  };

  // Handle duplicate conversation
  const handleDuplicateConversation = () => {
    Swal.fire('Feature Coming Soon', 'Duplicate conversation feature will be available soon.', 'info');
  };

  // Handle archive conversation
  const handleArchiveConversation = () => {
    Swal.fire('Feature Coming Soon', 'Archive conversation feature will be available soon.', 'info');
  };

  // Handle start editing title
  const handleStartEdit = (conv) => {
    setEditingId(conv.id);
    setEditTitle(conv.testTitle || '');
  };

  // Handle save title
  const handleSaveTitle = async (conv) => {
    if (!editTitle.trim()) {
      Swal.fire('Error', 'Title cannot be empty', 'error');
      return;
    }

    try {
      await onUpdateConversationTitle(conv.id, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update title:', error);
      Swal.fire('Error', 'Failed to update title', 'error');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // Handle key press in edit input
  const handleKeyPress = (e, conv) => {
    if (e.key === 'Enter') {
      handleSaveTitle(conv);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Search Bar (hide in Trash view) */}
      {!isTrashView && (
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      )}

      {/* New Conversation Button (hide in Trash view) */}
      {!isTrashView && (
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            data-tour-id={tourEnabled ? "new-conversation" : undefined}
          >
            <Plus size={16} />
            New Conversation
          </button>
        </div>
      )}

      {/* Restore All Button in Trash view */}
      {isTrashView && filteredConversations.length > 0 && (
        <div className="p-3 border-b border-gray-100 flex justify-between gap-2">
          <button
            onClick={onRestoreAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw size={16} />
            Restore All
          </button>
          <button
            onClick={onPermanentDeleteAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 size={16} />
            Delete All Forever
          </button>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
            <div className="text-gray-500 text-sm">
              {isTrashView
                ? 'No deleted conversations'
                : (searchQuery ? 'No conversations found' : 'No conversations yet')}
            </div>
            {!isTrashView && !searchQuery && (
              <button
                onClick={onNewConversation}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start your first conversation
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  if (isMobile && onMobileToggle) {
                    onMobileToggle(false);
                  }
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all group relative ${
                  selectedId === conv.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {editingId === conv.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveTitle(conv)}
                            onKeyPress={(e) => handleKeyPress(e, conv)}
                            autoFocus
                            className="flex-1 px-1 py-0.5 border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveTitle(conv);
                            }}
                            className="p-0.5 text-green-600 hover:text-green-700"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="p-0.5 text-red-600 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-1">
                          <div className="font-medium text-gray-900 truncate flex items-center gap-1 group/title flex-1">
                            {String(conv.testTitle || 'Untitled Test')}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(conv);
                              }}
                              className="opacity-40 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-all p-0.5 rounded hover:bg-gray-100"
                              title="Edit title"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                      {conv.favorite && (
                        <Star size={12} className="text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {getConversationPreview(conv)}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTimestamp(conv.created_at || conv.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {getMessageCount(conv)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConversationMenuToggle(conversationMenuOpen === conv.id ? null : conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
                {/* Conversation Menu */}
                {conversationMenuOpen === conv.id && (
                  <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                    {!isTrashView ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(conv);
                            onConversationMenuToggle(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit3 size={14} />
                          Edit Title
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink();
                            onConversationMenuToggle(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy size={14} />
                          Copy Link
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateConversation();
                            onConversationMenuToggle(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy size={14} />
                          Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveConversation();
                            onConversationMenuToggle(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                        <hr className="border-gray-200" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                            onConversationMenuToggle(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreConversation && onRestoreConversation(conv.id);
                            onConversationMenuToggle(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPermanentDelete && onPermanentDelete(conv.id);
                            onConversationMenuToggle(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete Forever
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isTrashView && filteredConversations.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}</span>
            {searchQuery && (
              <span>Filtered results</span>
            )}
          </div>
          <button
            onClick={onClearAll}
            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
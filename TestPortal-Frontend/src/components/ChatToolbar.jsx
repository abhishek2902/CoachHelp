import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Eye, 
  Download, 
  Save, 
  Share2, 
  Maximize2, 
  RefreshCw, 
  MoreVertical,
  Settings,
  FileUp,
  FileDown,
  Code,
  MessageSquare,
  Bot,
  Clock,
  Star,
  MoveHorizontal,
  PanelLeft,
  PanelRight,
  Layout,
  Percent,
  LoaderCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const ChatToolbar = ({
  selectedConv,
  activePanel,
  onPanelChange,
  onNewConversation,
  onSaveDraft,
  onCopyLink,
  onFullPreview,
  onRefresh,
  onMobileToggle,
  isMobile,
  savingDraft,
  onWidthControl,
  isNarrow,
  aiTaskQueue,
  jobsDropdownOpen,
  setJobsDropdownOpen,
  expandedMessages,
  setExpandedMessages,
  onCancelAiTask,
  onShowHint,
  tourEnabled = false
}) => {
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const layoutMenuRef = useRef(null);
  const jobsDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutMenuRef.current && !layoutMenuRef.current.contains(event.target)) {
        setLayoutMenuOpen(false);
      }
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(event.target)) {
        setJobsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (layoutMenuOpen || jobsDropdownOpen || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [layoutMenuOpen, jobsDropdownOpen, mobileMenuOpen]);

  const getConversationStats = () => {
    if (!selectedConv) return null;
    
    const messages = selectedConv.messages || [];
    const userMessages = messages.filter(m => m.sender === 'user').length;
    const aiMessages = messages.filter(m => m.sender === 'ai').length;
    
    return { userMessages, aiMessages, total: messages.length };
  };

  const stats = getConversationStats();

  return (
    <div className={`bg-white border-b border-gray-200 ${isMobile ? 'p-3' : (isNarrow ? 'p-2' : 'p-4')}`}>
      <div className={`flex items-center justify-between ${isMobile ? 'gap-2' : (isNarrow ? 'gap-2' : '')}`}>
        <div className={`flex items-center ${isMobile ? 'gap-3' : (isNarrow ? 'gap-2' : 'gap-4')}`}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => onMobileToggle(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Show Conversations"
            >
              <Menu size={24} />
            </button>
          )}
          
          {/* Conversation Info */}
          <div>
            <h1 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : (isNarrow ? 'text-base' : 'text-lg')}`}>
              {selectedConv?.testTitle || 'AI Conversation'}
            </h1>
            {selectedConv && (
              <div className={`flex items-center ${isMobile ? 'gap-1 text-xs' : (isNarrow ? 'gap-2 text-xs' : 'gap-4 text-sm text-gray-500')}`}>
                <span className="flex items-center gap-1">
                  <MessageSquare size={isMobile ? 12 : (isNarrow ? 12 : 14)} />
                  {stats?.total || 0} messages
                </span>
                {stats && !isMobile && !isNarrow && (
                  <>
                    <span className="flex items-center gap-1">
                      <Bot size={14} />
                      {stats.aiMessages} AI
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {selectedConv.created_at ? 
                        new Date(selectedConv.created_at).toLocaleDateString() : 
                        'Recent'
                      }
                    </span>
                  </>
                )}
                {selectedConv.favorite && !isMobile && !isNarrow && (
                  <Star size={14} className="text-yellow-500" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-1 ${isMobile ? 'gap-2' : (isNarrow ? '' : '')}`}>
          {/* Mobile Menu Button */}
          {isMobile ? (
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="More Actions"
              >
                <MoreVertical size={24} />
              </button>
              
              {/* Mobile Menu Dropdown */}
              {mobileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                  <div className="p-2 space-y-1">
                    {/* Refresh */}
                    <button
                      onClick={() => {
                        onRefresh();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw size={18} />
                      <span className="text-sm">Refresh</span>
                    </button>

                    {/* New Conversation */}
                    <button
                      onClick={() => {
                        onNewConversation();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MessageSquare size={18} />
                      <span className="text-sm">New Conversation</span>
                    </button>

                    {/* Show Hint */}
                    {onShowHint && (
                      <button
                        onClick={() => {
                          onShowHint();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="text-lg">💡</span>
                        <span className="text-sm">Show Help</span>
                      </button>
                    )}

                    {/* Preview */}
                    <button
                      onClick={() => {
                        if (activePanel === 'preview') {
                          onPanelChange('chat');
                        } else {
                          onPanelChange('preview');
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activePanel === 'preview'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Eye size={18} />
                      <span className="text-sm">
                        {activePanel === 'preview' ? 'Hide Preview' : 'Show Preview'}
                      </span>
                    </button>

                    {/* Save Draft */}
                    <button
                      onClick={() => {
                        onSaveDraft();
                        setMobileMenuOpen(false);
                      }}
                      disabled={savingDraft}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingDraft ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                      ) : (
                        <Save size={18} />
                      )}
                      <span className="text-sm">Save Draft</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => {
                        onCopyLink();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Share2 size={18} />
                      <span className="text-sm">Share Conversation</span>
                    </button>

                    {/* Full Preview */}
                    <button
                      onClick={() => {
                        onFullPreview();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Maximize2 size={18} />
                      <span className="text-sm">Full Preview</span>
                    </button>

                    {/* Jobs History */}
                    {aiTaskQueue && aiTaskQueue.length > 0 && aiTaskQueue.some(parent => parent.children && parent.children.length > 0) && (
                      <button
                        onClick={() => {
                          setJobsDropdownOpen(!jobsDropdownOpen);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                      >
                        <Bot size={18} />
                        <span className="text-sm">Jobs History</span>
                        {/* Notification badge for active jobs */}
                        {aiTaskQueue.some(parent => 
                          parent.children && parent.children.some(job => 
                            ['pending', 'processing'].includes(job.status)
                          )
                        ) && (
                          <span className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Action Buttons */
            <div className="flex items-center gap-1 mr-2">
              {/* Refresh */}
              <button
                onClick={onRefresh}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={isNarrow ? 14 : 16} />
              </button>

              {/* New Conversation */}
              <button
                onClick={onNewConversation}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="New Conversation"
              >
                <MessageSquare size={isNarrow ? 14 : 16} />
              </button>

              {/* Show Hint */}
              {onShowHint && (
                <button
                  onClick={onShowHint}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-lg"
                  title="Show Help & Examples"
                >
                  💡
                </button>
              )}

              {/* Jobs History Dropdown */}
              {aiTaskQueue && aiTaskQueue.length > 0 && aiTaskQueue.some(parent => parent.children && parent.children.length > 0) && (
                <div className="relative" ref={jobsDropdownRef}>
                  <button
                    onClick={() => setJobsDropdownOpen(!jobsDropdownOpen)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors relative"
                    title="Jobs History"
                  >
                    <Bot size={isNarrow ? 14 : 16} />
                    {/* Notification badge for active jobs */}
                    {aiTaskQueue.some(parent => 
                      parent.children && parent.children.some(job => 
                        ['pending', 'processing'].includes(job.status)
                      )
                    ) && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    )}
                    {/* Job count badge */}
                    {aiTaskQueue.length > 0 && (
                      <span className="absolute -bottom-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {aiTaskQueue.reduce((total, parent) => total + (parent.children?.length || 0), 0)}
                      </span>
                    )}
                  </button>
                  
                  {/* Jobs Dropdown Menu */}
                  {jobsDropdownOpen && (
                    <div className={`absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-y-auto min-w-[300px] max-w-[400px] max-h-96`}>
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 sticky top-0 bg-white">
                        AI Jobs History
                      </div>
                      <div className="p-2 space-y-2">
                        {aiTaskQueue.filter(parent => parent.children && parent.children.length > 0).map(parent => (
                          <div key={parent.parent_id}>
                            {parent.children.map((job, idx) => {
                              let jobName = job.job_name || `Job ${idx + 1}`;
                              try {
                                if (!job.job_name && job.result) {
                                  const parsed = typeof job.result === 'string' ? JSON.parse(job.result) : job.result;
                                  if (parsed && parsed.job_name) {
                                    jobName = parsed.job_name;
                                  }
                                }
                              } catch {/* ignore JSON parse errors for job name */}
                              return (
                                <div
                                  key={job.id}
                                  className={`p-2 rounded-lg border ${
                                    job.status === 'done' ? 'bg-green-50 border-green-200' : 
                                    job.status === 'failed' ? 'bg-red-50 border-red-200' : 
                                    'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="font-semibold text-xs text-gray-700 mb-1">
                                        {jobName}
                                      </div>
                                      <div className="text-xs">
                                        {job.status === 'pending' && (
                                          <span className="text-gray-500 flex items-center gap-1">
                                            <LoaderCircle className="animate-spin" size={12} /> Pending
                                          </span>
                                        )}
                                        {job.status === 'processing' && (
                                          <span className="text-blue-600 flex items-center gap-1">
                                            <LoaderCircle className="animate-spin" size={12} /> Processing
                                          </span>
                                        )}
                                        {job.status === 'done' && (
                                          <span className="text-green-600 flex items-center gap-1">
                                            ✅ Done
                                          </span>
                                        )}
                                        {job.status === 'failed' && (
                                          <span className="text-red-600 flex items-center gap-1">
                                            ❌ Failed: {job.error}
                                          </span>
                                        )}
                                        {job.status === 'cancelled' && (
                                          <span className="text-gray-400 flex items-center gap-1">
                                            🚫 Cancelled
                                          </span>
                                        )}
                                      </div>
                                      {/* Show job details if available */}
                                      {job.result && (
                                        <div className="mt-2">
                                          <button 
                                            className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                                            onClick={() => {
                                              const jobKey = `job-${job.id}`;
                                              if (expandedMessages.has(jobKey)) {
                                                const newSet = new Set(expandedMessages);
                                                newSet.delete(jobKey);
                                                setExpandedMessages(newSet);
                                              } else {
                                                setExpandedMessages(prev => new Set([...prev, jobKey]));
                                              }
                                            }}
                                          >
                                            {expandedMessages.has(`job-${job.id}`) ? (
                                              <>Hide details <ChevronUp size={10} /></>
                                            ) : (
                                              <>Show details <ChevronDown size={10} /></>
                                            )}
                                          </button>
                                          {expandedMessages.has(`job-${job.id}`) && (
                                            <div className="mt-2 p-2 bg-white rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto border">
                                              {typeof job.result === 'string' ? job.result : JSON.stringify(job.result, null, 2)}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {(job.status === 'pending' || job.status === 'processing') && (
                                      <button
                                        onClick={() => onCancelAiTask(job.id)}
                                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                        title="Cancel Job"
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Actions */}
          <div className={`flex items-center gap-1 border-l border-gray-200 pl-2 ${isMobile ? 'gap-1' : (isNarrow ? '' : '')}`}>
            {/* Layout Dropdown - Hidden on mobile */}
            {activePanel !== 'chat' && !isMobile && (
              <div className="relative" ref={layoutMenuRef}>
                <button
                  onClick={() => setLayoutMenuOpen(!layoutMenuOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Layout Options"
                >
                  <Layout size={isNarrow ? 14 : 16} />
                </button>
                
                {/* Layout Dropdown Menu */}
                {layoutMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                      Panel Width
                    </div>
                    <button
                      onClick={() => {
                        onWidthControl && onWidthControl('narrow');
                        setLayoutMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <PanelLeft size={14} />
                      Narrow (280px)
                    </button>
                    <button
                      onClick={() => {
                        onWidthControl && onWidthControl('medium');
                        setLayoutMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <MoveHorizontal size={14} />
                      Medium (384px)
                    </button>
                    <button
                      onClick={() => {
                        onWidthControl && onWidthControl('wide');
                        setLayoutMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <PanelRight size={14} />
                      Wide (600px)
                    </button>
                    
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 mt-2">
                      Layout Distribution
                    </div>
                    <button
                      onClick={() => {
                        onWidthControl && onWidthControl('chat20');
                        setLayoutMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Percent size={14} />
                      20% Chat, 80% Preview
                    </button>
                    <button
                      onClick={() => {
                        onWidthControl && onWidthControl('preview80');
                        setLayoutMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Percent size={14} />
                      80% Preview, 20% Chat
                    </button>
                    <button
                      onClick={() => {
                        onWidthControl && onWidthControl('fifty50');
                        setLayoutMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Percent size={14} />
                      50% Chat, 50% Preview
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            <button
              onClick={() => {
                if (activePanel === 'preview') {
                  onPanelChange('chat');
                } else {
                  onPanelChange('preview');
                  // Set 50/50 layout when opening preview (only on desktop)
                  if (!isMobile && onWidthControl) {
                    onWidthControl('fifty50');
                  }
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'preview'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Preview Test"
              data-tour-id={tourEnabled ? "preview-button" : undefined}
            >
              <Eye size={isMobile ? 16 : (isNarrow ? 14 : 16)} />
            </button>

            {/* Save Draft */}
            {!isMobile && !isNarrow && (
              <button
                onClick={onSaveDraft}
                disabled={savingDraft}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Save Draft"
                data-tour-id={tourEnabled ? "save-draft" : undefined}
              >
                {savingDraft ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                ) : (
                  <Save size={16} />
                )}
              </button>
            )}

            {/* Share */}
            {!isMobile && !isNarrow && (
              <button
                onClick={onCopyLink}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="Share Conversation"
              >
                <Share2 size={16} />
              </button>
            )}

            {/* Full Preview */}
            {!isMobile && !isNarrow && (
              <button
                onClick={onFullPreview}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="Full Preview"
                data-tour-id={tourEnabled ? "full-preview" : undefined}
              >
                <Maximize2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar for Saving */}
      {savingDraft && !isMobile && !isNarrow && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Saving draft...
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatToolbar; 
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  StopCircle, 
  Upload,
  FileText,
  Image,
  Video,
  X,
  Volume2,
  Plus
} from 'lucide-react';

const ChatInput = ({
  input,
  onInputChange,
  onSend,
  loading,
  disabled,
  onFileUpload,
  onVoiceRecord,
  placeholder = "Type your message..."
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle send button click
  const handleSend = () => {
    if (!input.trim() || loading || disabled) return;
    onSend();
    // Reset textarea height after sending
    setTimeout(() => {
      resetTextareaHeight();
    }, 100);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onFileUpload) {
      const files = Array.from(e.dataTransfer.files);
      onFileUpload(files);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    onInputChange(e);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    const maxHeight = isMobile ? 100 : 120;
    const minHeight = isMobile ? 44 : 48;
    
    // Calculate the new height
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
    textarea.style.height = newHeight + 'px';
  };

  // Reset textarea height when input is cleared
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const minHeight = isMobile ? 44 : 48;
      textarea.style.height = minHeight + 'px';
    }
  };

  // Watch for input changes to reset height when cleared
  useEffect(() => {
    if (!input.trim()) {
      resetTextareaHeight();
    }
  }, [input, isMobile]);

  // Get file type icon
  const getFileTypeIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={16} />;
    if (file.type.startsWith('video/')) return <Video size={16} />;
    return <FileText size={16} />;
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        if (onVoiceRecord) {
          onVoiceRecord(blob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handleVoiceButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Drag and Drop Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-500 rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center">
            <Upload size={32} className="text-blue-500 mx-auto mb-2" />
            <p className="text-blue-500 font-medium">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Main Input Container - WhatsApp/ChatGPT Style */}
      <div 
        className={`
          ${isMobile ? 'mx-3 mb-4' : 'mx-4 mb-4'} 
          bg-white border border-gray-200 rounded-2xl shadow-lg
          ${isMobile ? 'p-3' : 'p-4'}
          transition-all duration-200 hover:shadow-xl focus-within:shadow-xl focus-within:border-blue-300
          ${isMobile ? 'bg-gradient-to-r from-gray-50 to-white' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* File Upload Preview */}
        {fileInputRef.current?.files && fileInputRef.current.files.length > 0 && (
          <div className={`mb-3 p-3 bg-gray-50 rounded-xl border ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <div className="flex items-center gap-2 text-gray-600">
              {getFileTypeIcon(fileInputRef.current.files[0])}
              <span className="flex-1 truncate">{fileInputRef.current.files[0].name}</span>
              <button
                onClick={() => {
                  fileInputRef.current.value = '';
                  const event = new Event('change', { bubbles: true });
                  fileInputRef.current.dispatchEvent(event);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </div>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-2">
          {/* Attachment Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              disabled={disabled}
              className={`
                p-2 rounded-full transition-all duration-200 disabled:opacity-50
                ${showAttachmentMenu 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
                ${isMobile ? 'p-2.5' : 'p-2'}
              `}
              title="Attach file"
            >
              <Plus size={isMobile ? 20 : 18} />
            </button>

            {/* Attachment Menu Dropdown */}
            {showAttachmentMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-20 min-w-[140px]">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowAttachmentMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip size={16} />
                  <span className="text-sm">Document</span>
                </button>
                <button
                  onClick={() => {
                    // Trigger file input for images
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      if (e.target.files && onFileUpload) {
                        onFileUpload(Array.from(e.target.files));
                      }
                    };
                    input.click();
                    setShowAttachmentMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Image size={16} />
                  <span className="text-sm">Photo</span>
                </button>
              </div>
            )}
          </div>

          {/* Voice Recording Button */}
          <button
            onClick={handleVoiceButtonClick}
            disabled={disabled}
            className={`
              p-2 rounded-full transition-all duration-200 disabled:opacity-50
              ${isRecording 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
              ${isMobile ? 'p-2.5' : 'p-2'}
            `}
            title={isRecording ? 'Stop recording' : 'Voice message'}
          >
            {isRecording ? <StopCircle size={isMobile ? 20 : 18} /> : <Mic size={isMobile ? 20 : 18} />}
          </button>

          {/* Text Input Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                // Ensure proper height when focused
                if (textareaRef.current) {
                  const textarea = textareaRef.current;
                  if (input.trim()) {
                    textarea.style.height = 'auto';
                    const maxHeight = isMobile ? 100 : 120;
                    const minHeight = isMobile ? 44 : 48;
                    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
                    textarea.style.height = newHeight + 'px';
                  }
                }
              }}
              placeholder={placeholder}
              disabled={loading || disabled}
              rows={1}
              className={`
                w-full px-4 py-3 border-0 bg-transparent text-gray-900 
                placeholder-gray-500 focus:outline-none disabled:opacity-50 
                resize-none leading-relaxed transition-all duration-200 ease-out
                ${isMobile ? 'text-base px-3 py-2.5' : 'text-sm lg:text-base'}
              `}
              style={{ 
                minHeight: isMobile ? '44px' : '48px',
                maxHeight: isMobile ? '100px' : '120px',
                height: isMobile ? '44px' : '48px'
              }}
            />
            
            {/* Character Count - Only show on mobile when typing */}
            {input.length > 0 && isMobile && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-400 bg-white px-1 rounded">
                {input.length}/4000
              </div>
            )}
          </div>

          {/* Emoji Picker Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className={`
              p-2 rounded-full transition-all duration-200 disabled:opacity-50
              ${showEmojiPicker 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
              ${isMobile ? 'p-2.5' : 'p-2'}
            `}
            title="Emoji"
          >
            <Smile size={isMobile ? 20 : 18} />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || disabled}
            className={`
              p-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${input.trim() && !loading && !disabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-100 text-gray-400'
              }
              ${isMobile ? 'p-2.5' : 'p-2'}
            `}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send size={isMobile ? 20 : 18} />
            )}
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.json,.png,.jpg,.jpeg,.gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className={`
            absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20
            ${isMobile ? 'w-64' : 'w-72'}
          `}>
            <div className="grid grid-cols-8 gap-1">
              {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onInputChange({ target: { value: input + emoji } });
                    setShowEmojiPicker(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className={`
            absolute bottom-full left-0 mb-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-lg
            ${isMobile ? 'text-xs px-3 py-1.5' : ''}
          `}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <Volume2 size={isMobile ? 12 : 14} />
            Recording... {formatRecordingTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showEmojiPicker || showAttachmentMenu) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowEmojiPicker(false);
            setShowAttachmentMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatInput; 
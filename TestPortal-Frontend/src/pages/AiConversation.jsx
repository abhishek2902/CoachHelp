import React, { useEffect, useState } from 'react';
import aiConversationService from '../services/aiConversationService';
import TestFullPreview from '../components/TestFullPreview';
import JsonStructureViewer from '../components/JsonStructureViewer';
import LargeDatasetWarning from '../components/LargeDatasetWarning';
import ConversationList from '../components/ConversationList';
import ChatToolbar from '../components/ChatToolbar';
import ChatInput from '../components/ChatInput';
import ResizableDivider from '../components/ResizableDivider';
import ConversationalHint from '../components/ConversationalHint';
import Joyride from 'react-joyride';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  MessageSquare,
  Eye,
  Download,
  Upload,
  Code,
  FileText,
  Settings,
  LoaderCircle,
  Maximize2,
  Plus,
  Search,
  Trash2,
  Copy,
  Share2,
  Archive,
  Star,
  Clock,
  Send,
  Bot,
  User,
  RefreshCw,
  Save,
  FileUp,
  FileDown,
  Grid3X3,
  Filter,
  ChevronDown,
  ChevronUp,
  Square
} from 'lucide-react';
import Swal from 'sweetalert2';
import SidebarAI from '../components/SidebarAI';
import { Menu as LucideMenu, LayoutGrid, List, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AiConversation = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage] = useState('');
  const [error, setError] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [activePanel, setActivePanel] = useState('chat'); // 'chat', 'preview', 'json'
  const [jsonExportData, setJsonExportData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [conversationMenuOpen, setConversationMenuOpen] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Sidebar hidden by default
  const [showConversationList, setShowConversationList] = useState(false); // Mobile conversation list visibility
  const [showTrash, setShowTrash] = useState(false); // Toggle for Trash view
  const [trashedConversations, setTrashedConversations] = useState([]); // Store deleted conversations
  const [panelWidth, setPanelWidth] = useState(384); // Panel width in pixels
  const [chatPanelPercent, setChatPanelPercent] = useState(null); // null means full width when preview is hidden
  const [previewPanelPercent, setPreviewPanelPercent] = useState(null); // null means preview is hidden
  const [aiTaskQueue, setAiTaskQueue] = useState([]); // [{parent_id, children: [{id, status, ...}]}]
  const [expandedMessages, setExpandedMessages] = useState(new Set()); // Track which messages are expanded
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false); // Track jobs dropdown state
  
  // Quick Tour State
  const [tourOpen, setTourOpen] = useState(false);
  const [showConversationalHint, setShowConversationalHint] = useState(false);
  const tourSteps = [
    {
      target: '[data-tour-id="conversation-list"]',
      content: 'This is your conversation list. Here you can see all your AI conversations and switch between them.',
      placement: 'right',
    },
    {
      target: '[data-tour-id="new-conversation"]',
      content: 'Click here to start a new conversation with the AI.',
      placement: 'bottom',
    },
    {
      target: '[data-tour-id="conversational-hint"]',
      content: 'When you start a new conversation, you\'ll see helpful hints and sample prompts to guide you in creating tests.',
      placement: 'bottom',
    },
    {
      target: '[data-tour-id="chat-input"]',
      content: 'Type your message here to chat with the AI. You can ask it to create tests, modify questions, or help with any test-related tasks.',
      placement: 'top',
    },
    {
      target: '[data-tour-id="preview-button"]',
      content: 'Click here to preview your test in real-time as the AI generates it.',
      placement: 'left',
    },
    {
      target: '[data-tour-id="save-draft"]',
      content: 'Save your conversation as a draft test that you can edit and publish later.',
      placement: 'left',
    },
    {
      target: '[data-tour-id="full-preview"]',
      content: 'Open a full-screen preview of your test to see how it will look to candidates.',
      placement: 'left',
    },
  ];

  const navigate = useNavigate();
  const [tokenWarning, setTokenWarning] = useState('');
  const [tokenErrorType, setTokenErrorType] = useState('none'); // 'none', 'low', 'empty'

  // Helper to check token balance
  const checkTokenBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Only redirect to login if not on home page
        if (window.location.pathname !== '/') {
          navigate('/login');
        }
        return false;
      }
      const base = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.get(`${base}/token_transactions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 1 },
      });
      const balance = Number(res.data.wallet_balance);
      if (!balance || isNaN(balance) || balance <= 0) {
        setTokenWarning('You have no tokens left. Please purchase tokens to continue using AI features.');
        setTokenErrorType('empty');
        navigate('/account?alert=purchase_tokens');
        return false;
      }
      if (balance < 10) {
        setTokenWarning('You are about to run out of tokens. Please recharge soon to avoid interruption.');
        setTokenErrorType('low');
      } else {
        setTokenWarning('');
        setTokenErrorType('none');
      }
      return true;
    } catch {
      setTokenWarning('Could not fetch token balance. Please try again.');
      setTokenErrorType('empty');
      navigate('/account?alert=purchase_tokens');
      return false;
    }
  };

  // Mobile detection with better breakpoints
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // Changed from 1024 to 768 for better mobile detection
      setIsMobile(mobile);
      if (mobile) {
        setShowConversationList(false); // Hide conversation list on mobile by default
        // Reset panel states for mobile
        setActivePanel('chat');
        setChatPanelPercent(null);
        setPreviewPanelPercent(null);
      } else {
        setShowConversationList(true); // Show conversation list on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Quick Tour Logic - Trigger on hard refresh up to 10 times
  useEffect(() => {
    const refreshCount = parseInt(localStorage.getItem('aiConversationRefreshCount') || '0');
    const hasSeenTour = localStorage.getItem('aiConversationTourShown');
    
    // Increment refresh count
    const newRefreshCount = refreshCount + 1;
    localStorage.setItem('aiConversationRefreshCount', newRefreshCount.toString());
    
    // Show tour if refresh count is between 1-10 and tour hasn't been shown
    if (newRefreshCount >= 1 && newRefreshCount <= 10 && !hasSeenTour) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        setTourOpen(true);
        localStorage.setItem('aiConversationTourShown', 'true');
      }, 1000);
    }
  }, []);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('ai_conversations');
    const savedSelectedId = localStorage.getItem('ai_selected_conversation_id');

    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
        if (savedSelectedId && parsedConversations.find(c => c.id === parseInt(savedSelectedId))) {
          setSelectedId(parseInt(savedSelectedId));
        } else if (parsedConversations.length > 0) {
          setSelectedId(parsedConversations[0].id);
        }
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
        localStorage.removeItem('ai_conversations');
        localStorage.removeItem('ai_selected_conversation_id');
      }
    }

    // Always sync with server data on page load to ensure consistency
    setTimeout(async () => {
      try {
        const serverData = await aiConversationService.getAllConversations();
        if (serverData.length > 0) {
          setConversations(prev => {
            // Merge server data with local data, preserving local changes
            const merged = serverData.map(serverConv => {
              const localConv = prev.find(local => local.id === serverConv.id);
              if (localConv) {
                // Keep local messages if they're more recent
                const localMessages = localConv.messages || [];
                const serverMessages = serverConv.messages || [];
                const messages = localMessages.length >= serverMessages.length ? localMessages : serverMessages;
                return { ...serverConv, messages };
              }
              return serverConv;
            });
            return merged;
          });
        }
      } catch (error) {
        console.warn('Failed to sync with server on page load:', error);
      }
    }, 1000); // Wait 1 second after initial load
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save selected conversation ID to localStorage
  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('ai_selected_conversation_id', selectedId.toString());
    }
  }, [selectedId]);

  // Load panel width from localStorage on mount
  useEffect(() => {
    const savedPanelWidth = localStorage.getItem('ai_panel_width');
    const savedChatPercent = localStorage.getItem('ai_chat_percent');
    const savedPreviewPercent = localStorage.getItem('ai_preview_percent');
    const savedActivePanel = localStorage.getItem('ai_active_panel');
    
    if (savedPanelWidth) {
      setPanelWidth(parseInt(savedPanelWidth));
    }
    
    // Load saved panel state if available
    if (savedActivePanel) {
      setActivePanel(savedActivePanel);
    }
    
    // Load saved percentage layout if available and preview was active
    if (savedChatPercent && savedPreviewPercent && savedActivePanel === 'preview') {
      setChatPanelPercent(parseInt(savedChatPercent));
      setPreviewPanelPercent(parseInt(savedPreviewPercent));
    } else {
      // Default: preview hidden, chat takes full width
      setChatPanelPercent(null);
      setPreviewPanelPercent(null);
    }
  }, []);

  // Save panel width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ai_panel_width', panelWidth.toString());
  }, [panelWidth]);

  // Save active panel to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ai_active_panel', activePanel);
  }, [activePanel]);

  // Save percentage layout to localStorage whenever it changes
  useEffect(() => {
    if (chatPanelPercent !== null && previewPanelPercent !== null) {
      localStorage.setItem('ai_chat_percent', chatPanelPercent.toString());
      localStorage.setItem('ai_preview_percent', previewPanelPercent.toString());
    }
  }, [chatPanelPercent, previewPanelPercent]);

  // Re-check token balance when user returns to the page (e.g., after purchasing tokens)
  useEffect(() => {
    const handleFocus = async () => {
      // Check if user came back from account page (after purchasing tokens)
      const urlParams = new URLSearchParams(window.location.search);
      const fromAccount = urlParams.get('from_account');
      
      if (fromAccount === 'true') {
        // Remove the parameter
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('from_account');
        window.history.replaceState({}, '', newUrl);
        
        // Re-check token balance without redirecting if user has tokens
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            // Only redirect to login if not on home page
            if (window.location.pathname !== '/') {
              navigate('/login');
            }
            return;
          }
          const base = import.meta.env.VITE_API_BASE_URL;
          const res = await axios.get(`${base}/token_transactions`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { per_page: 1 },
          });
          const balance = Number(res.data.wallet_balance);
          if (!balance || isNaN(balance) || balance <= 0) {
            navigate('/account?alert=purchase_tokens');
            return;
          }
          if (balance < 10) {
            setTokenWarning('You are about to run out of tokens. Please recharge to continue using AI features.');
          } else {
            setTokenWarning('');
          }
          // If we get here, user has tokens, so we can continue
        } catch {
          navigate('/account?alert=purchase_tokens');
        }
      }
    };

    const handleVisibilityChange = async () => {
      // When page becomes visible again, refresh token balance
      if (!document.hidden) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const base = import.meta.env.VITE_API_BASE_URL;
            const res = await axios.get(`${base}/token_transactions`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { per_page: 1 },
            });
            const balance = Number(res.data.wallet_balance);
            if (balance < 10) {
              setTokenWarning('You are about to run out of tokens. Please recharge to continue using AI features.');
            } else {
              setTokenWarning('');
            }
          }
        } catch (error) {
          console.warn('Failed to refresh token balance:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also check on page load if coming from account page
    handleFocus();

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check token balance and fetch conversations on page load
  useEffect(() => {
    async function initializePage() {
      // Check token balance first
      const hasTokens = await checkTokenBalance();
      if (!hasTokens) {
        return; // User will be redirected to account page
      }

      // Only fetch conversations if we have tokens and no local data
      if (conversations.length === 0) {
        try {
          const data = await aiConversationService.getAllConversations({ type: 'test_generate' });
          setConversations(data);
          setSelectedId(data.length > 0 ? data[0].id : null);
          // Fetch trashed conversations as well
          const trashed = await aiConversationService.getAllConversations({ deleted: true });
          setTrashedConversations(trashed);
        } catch {
          setError('Failed to load conversations.');
          handleNewConversation();
        }
      }
    }
    initializePage();
  }, []);

  // Fetch trashed conversations on Trash view toggle or after restore/delete
  useEffect(() => {
    if (showTrash) {
      async function fetchTrashed() {
        try {
          const trashed = await aiConversationService.getAllConversations({ deleted: true });
          setTrashedConversations(trashed);
        } catch {
          setError('Failed to load trashed conversations.');
        }
      }
      fetchTrashed();
    }
  }, [showTrash]);

  // Sync conversations with server periodically
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (conversations.length > 0) {
        try {
          const serverData = await aiConversationService.getAllConversations();
          // Merge server data with local data, preserving local changes
          setConversations(prev => {
            const merged = serverData.map(serverConv => {
              const localConv = prev.find(local => local.id === serverConv.id);
              if (localConv) {
                // Keep local messages if they're more recent
                const localMessages = localConv.messages || [];
                const serverMessages = serverConv.messages || [];
                const messages = localMessages.length >= serverMessages.length ? localMessages : serverMessages;
                return { ...serverConv, messages };
              }
              return serverConv;
            });
            return merged;
          });
        } catch (error) {
          console.warn('Failed to sync conversations:', error);
        }
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [conversations.length]);

  // Fetch messages and test data when a conversation is selected
  useEffect(() => {
    if (!selectedId) return;
    setPreviewLoading(true);
    setAiTaskQueue([]); // Reset jobs on conversation change
    async function fetchDetails() {
      try {
        const details = await aiConversationService.getConversationDetails(selectedId);
        console.log('Conversation details received:', details);
        console.log('Test data structure:', details.test_update);
        if (details.test_update?.sections) {
          details.test_update.sections.forEach((section, sectionIdx) => {
            console.log(`Section ${sectionIdx + 1} (${section.name}):`, section);
            if (section.questions) {
              section.questions.forEach((question, qIdx) => {
                console.log(`  Question ${qIdx + 1}:`, {
                  content: question.content,
                  question_type: question.question_type,
                  options: question.options,
                  option_1: question.option_1,
                  option_2: question.option_2,
                  option_3: question.option_3,
                  option_4: question.option_4,
                  correct_answer: question.correct_answer
                });
              });
            }
          });
        }
        setConversations(prev =>
          prev.map(c => c.id === selectedId ? { 
            ...c, 
            ...details,
            testData: details.test_update || c.testData // Map test_update to testData
          } : c)
        );
      } catch {
        setError('Failed to load conversation details.');
      } finally {
        setPreviewLoading(false);
      }
    }
    fetchDetails();
  }, [selectedId]);

  const selectedConv = conversations.find(c => c.id === selectedId);
  
  // Debug logging for selectedConv
  useEffect(() => {
    if (selectedId) {
      console.log('Selected ID:', selectedId);
      console.log('Selected conversation found:', !!selectedConv);
      console.log('Selected conversation data:', selectedConv);
    }
  }, [selectedId, selectedConv]);

  // Handle conversation selection (with mobile behavior)
  const handleSelectConversation = async (conversationId) => {
    console.log('Selecting conversation:', conversationId);
    setSelectedId(conversationId);
    if (isMobile) {
      setShowConversationList(false);
    }
    // Force refresh conversation details
    setPreviewLoading(true);
    try {
      await refreshConversationDetails(conversationId);
      
      // The preview panel opening logic is now handled in refreshConversationDetails
      // based on the actual data received from the backend
    } finally {
      setPreviewLoading(false);
    }
  };

  // Wrap AI actions with token check
  const handleSend = async () => {
    const ok = await checkTokenBalance();
    if (!ok) return;
    if (!input.trim()) return;
    if (!selectedConv) {
      console.error('No conversation selected');
      setError('No conversation selected. Please try again.');
      return;
    }
    setLoading(true);
    setError('');

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat immediately (will be synced with backend)
    const userMessageObj = {
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    };

    // Hide conversational hint when user sends first message
    if (showConversationalHint) {
      console.log('Hiding conversational hint when user sends message');
      setShowConversationalHint(false);
    }

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedId
          ? {
              ...c,
              messages: [...(c.messages || []), userMessageObj],
              lastMessage: `You: ${userMessage}`,
            }
          : c
      )
    );

    try {
      // Let the AI handle all requests dynamically - no static word detection
      console.log('Sending message to AI:', userMessage);
      
      // Always send to the main AI endpoint and let it decide how to handle the request
      const result = await aiConversationService.sendMessage(userMessage, selectedConv.id);
      
      console.log('Result received:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result));
      console.log('Status check:', result.status === 'processing');
      console.log('AI task ID check:', result.ai_task_id);
      console.log('Parent task ID check:', result.parent_task_id);
      console.log('Job IDs check:', result.job_ids);

      if (result.status === 'processing' && result.ai_task_id) {
        console.log('Starting polling for AI task:', result.ai_task_id);
        pollAiTaskQueue(selectedConv.id);
      } else {
        // Handle immediate response
        const aiMessageObj = {
          sender: 'ai',
          text: result.reply || result.message || 'AI response received',
          timestamp: new Date().toISOString()
        };

        setConversations(prev =>
          prev.map(c =>
            c.id === selectedId
              ? {
                  ...c,
                  messages: [...(c.messages || []), aiMessageObj],
                  lastMessage: `AI: ${aiMessageObj.text}`,
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the user message if it failed
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedId
            ? {
                ...c,
                messages: c.messages ? c.messages.slice(0, -1) : [],
              }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    const ok = await checkTokenBalance();
    if (!ok) return;
    if (files.length === 0) return;
    if (!selectedConv) {
      console.error('No conversation selected for file upload');
      setError('No conversation selected. Please try again.');
      return;
    }
    
    setLoading(true);
    setError('');

    const file = files[0]; // Handle single file for now
    
    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      setError('File size must be less than 1MB');
      setLoading(false);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Please upload PDF, DOC, DOCX, TXT, JSON, or image files.');
      setLoading(false);
      return;
    }

    // Add user message about file upload
    const userMessageObj = {
      sender: 'user',
      text: `Uploaded file: ${file.name}`,
      timestamp: new Date().toISOString()
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedId
          ? {
              ...c,
              messages: [...(c.messages || []), userMessageObj],
              lastMessage: `You: Uploaded ${file.name}`,
            }
          : c
      )
    );

    try {
      // Upload file to backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversation_id', selectedConv.id);

      const result = await aiConversationService.uploadFile(formData);
      
      // Add AI response
      const aiMessageObj = {
        sender: 'ai',
        text: result.message || result.reply || 'File processed successfully. Here are the generated questions.',
        timestamp: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...(c.messages || []), aiMessageObj],
                lastMessage: `AI: ${aiMessageObj.text}`,
              }
            : c
        )
      );

      // Update test data if available
      if (result.test_update) {
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedId
              ? { ...c, testData: result.test_update }
              : c
          )
        );
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      let errorMessage = 'Failed to process file.';
      
      if (error.response) {
        if (error.response.status === 503) {
          errorMessage = 'AI service is currently unavailable. Please try again in a few minutes.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorMessageObj = {
        sender: 'ai',
        text: errorMessage,
        timestamp: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...(c.messages || []), errorMessageObj],
                lastMessage: `AI: ${errorMessage}`,
              }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle voice recording
  const handleVoiceRecord = async (audioBlob) => {
    const ok = await checkTokenBalance();
    if (!ok) return;
    if (!selectedConv) {
      console.error('No conversation selected for voice recording');
      setError('No conversation selected. Please try again.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Convert audio blob to file
      const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
      
      // Add user message about voice recording
      const userMessageObj = {
        sender: 'user',
        text: 'Voice message recorded',
        timestamp: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...(c.messages || []), userMessageObj],
                lastMessage: `You: Voice message`,
              }
            : c
        )
      );

      // Upload audio file for transcription
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('conversation_id', selectedConv.id);
      formData.append('type', 'audio');

      const result = await aiConversationService.uploadFile(formData);
      
      // Add AI response
      const aiMessageObj = {
        sender: 'ai',
        text: result.message || result.reply || 'Voice message processed successfully.',
        timestamp: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...(c.messages || []), aiMessageObj],
                lastMessage: `AI: ${aiMessageObj.text}`,
              }
            : c
        )
      );

      // Update test data if available
      if (result.test_update) {
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedId
              ? { ...c, testData: result.test_update }
              : c
          )
        );
      }

    } catch (error) {
      console.error('Error processing voice message:', error);
      let errorMessage = 'Failed to process voice message.';
      
      if (error.response) {
        if (error.response.status === 503) {
          errorMessage = 'AI service is currently unavailable. Please try again in a few minutes.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorMessageObj = {
        sender: 'ai',
        text: errorMessage,
        timestamp: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedId
            ? {
                ...c,
                messages: [...(c.messages || []), errorMessageObj],
                lastMessage: `AI: ${errorMessage}`,
              }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to refresh conversation details
  const refreshConversationDetails = async (conversationId) => {
    try {
      console.log('Refreshing conversation details for conversation:', conversationId);
      const updatedDetails = await aiConversationService.getConversationDetails(conversationId);
      console.log('Updated details received:', updatedDetails);
      console.log('Test update data:', updatedDetails.test_update);
      console.log('Sections in test update:', updatedDetails.test_update?.sections);
      
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId 
            ? { 
                ...c, 
                ...updatedDetails,
                testData: updatedDetails.test_update || c.testData
              } 
            : c
        )
      );
      
      // Automatically open preview panel if test data is available
      if (updatedDetails.test_update && activePanel !== 'preview') {
        setActivePanel('preview');
        if (!isMobile) {
          setChatPanelPercent(60);
          setPreviewPanelPercent(40);
        }
      }
      
      console.log('Conversation state updated with new test data');
    } catch (error) {
      console.error('Failed to refresh conversation details:', error);
    }
  };

  const pollAiTaskQueue = async (conversationId) => {
    console.log('Starting to poll AI task queue for conversation:', conversationId);
    let done = false;
    let pollCount = 0;
    let previousTaskStates = new Map(); // Track previous job states to detect changes
    let previousJobCount = 0; // Track previous total job count
    
    while (!done && pollCount < 30) { // Max 30 polls (60 seconds)
      try {
        console.log(`Poll attempt ${pollCount + 1} for conversation ${conversationId}`);
        const data = await aiConversationService.getAiTasksForConversation(conversationId);
        console.log('Poll result:', data);
        console.log('Tasks array:', data.tasks);
        console.log('Tasks length:', data.tasks?.length);
        console.log('Setting AI task queue with:', data.tasks);
        console.log('Current aiTaskQueue state before update:', aiTaskQueue);
        
        // Calculate current total job count
        const currentJobCount = data.tasks?.reduce((total, parent) => total + (parent.children?.length || 0), 0) || 0;
        
        // Check if new jobs were added (job count increased)
        const hasNewJobs = currentJobCount > previousJobCount;
        if (hasNewJobs && pollCount > 0) { // Don't auto-open on first poll
          console.log(`New jobs detected! Job count increased from ${previousJobCount} to ${currentJobCount}`);
          // Small delay to ensure smooth UX
          setTimeout(() => {
            setJobsDropdownOpen(true); // Automatically open job history
          }, 500);
        }
        
        // Check for newly completed jobs and update preview
        let hasNewCompletedJobs = false;
        if (data.tasks && data.tasks.length > 0) {
          data.tasks.forEach(parent => {
            if (parent.children && parent.children.length > 0) {
              parent.children.forEach(child => {
                const jobKey = `${parent.parent_id}-${child.id}`;
                const previousStatus = previousTaskStates.get(jobKey);
                
                // If job just completed (status changed to 'done')
                if (previousStatus && previousStatus !== 'done' && child.status === 'done') {
                  console.log(`Job ${child.id} just completed! Updating preview...`);
                  hasNewCompletedJobs = true;
                }
                
                // Update the state tracking
                previousTaskStates.set(jobKey, child.status);
              });
            }
          });
        }
        
        setAiTaskQueue(data.tasks || []);
        console.log('AI task queue state updated');
        
        // Update preview immediately if any job just completed
        if (hasNewCompletedJobs) {
          console.log('New jobs completed, updating preview immediately');
          await refreshConversationDetails(conversationId);
        }
        
        // Update previous job count for next iteration
        previousJobCount = currentJobCount;
        
        // If all jobs are done/failed/cancelled, stop polling
        if (!data.tasks || data.tasks.length === 0) {
          console.log('No tasks found, stopping polling');
          done = true;
        } else {
          const allDone = data.tasks.every(parent => {
            console.log('Checking parent:', parent);
            console.log('Parent children:', parent.children);
            return parent.children && parent.children.every(child => {
              console.log('Checking child status:', child.status);
              return ['done', 'failed', 'cancelled'].includes(child.status);
            });
          });
          console.log('All tasks done:', allDone);
          done = allDone;
        }
        
        pollCount++;
        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        console.error('Error polling AI tasks:', error);
        done = true;
      }
    }
    console.log('Finished polling AI task queue');
    // Final refresh after all jobs are done
    await refreshConversationDetails(conversationId);
  };

  const handleCancelAiTask = async (aiTaskId) => {
    await aiConversationService.cancelAiTask(aiTaskId);
    pollAiTaskQueue(selectedId);
  };

  const handleRefreshConversation = async () => {
    if (!selectedId) return;
    console.log('Manual refresh requested for conversation:', selectedId);
    await refreshConversationDetails(selectedId);
    console.log('Manual refresh completed');
  };

  // New conversation
  const handleNewConversation = async () => {
    setError('');
    setPreviewLoading(true);
    setAiTaskQueue([]); // Reset jobs on new conversation
    try {
      const newConv = await aiConversationService.findOrCreateConversation();
      console.log('New conversation created:', newConv);
      
      // Immediately set the selected conversation to the new one
      setSelectedId(newConv.conversation_id);
      setActivePanel('preview');
      if (!isMobile) {
        setChatPanelPercent(60);
        setPreviewPanelPercent(40);
      }
      if (isMobile) {
        setShowConversationList(false);
      }

      // Add the new conversation to the state immediately
      setConversations(prev => {
        const newConversation = {
          id: newConv.conversation_id,
          testTitle: "AI Conversation",
          lastMessage: "Hi! I'm your AI Test Assistant. I can help you create comprehensive tests with questions, sections, and settings. Check out the hints below for examples!",
          messages: newConv.messages || [],
          testData: newConv.test_update || {}
        };
        return [newConversation, ...prev];
      });

      // Show conversational hint for new conversations - always show for new conversations
      setShowConversationalHint(true);
      console.log('Setting conversational hint to show for new conversation');

      // Then fetch the complete list from backend to ensure consistency
      // Delay the refetch to allow the hint to show first
      setTimeout(async () => {
        await refetchConversations();
      }, 100);
      
    } catch {
      setError('Failed to start a new conversation.');
    } finally {
      setTimeout(() => {
        setPreviewLoading(false);
      }, 1000);
    }
  };

  // Handle using example from conversational hint
  const handleUseExample = (example) => {
    setInput(example);
    setShowConversationalHint(false);
  };

  // Helper to refetch both lists
  const refetchConversations = async () => {
    try {
      const active = await aiConversationService.getAllConversations({ type: 'test_generate' });
      console.log('Refetched conversations:', active);
      
      // Preserve the conversational hint state when refetching
      setConversations(() => {
        const newConversations = active;
        // If we have a selected conversation and showConversationalHint is true,
        // make sure the selected conversation is preserved
        if (selectedId && showConversationalHint) {
          const selectedConv = newConversations.find(c => c.id === selectedId);
          if (selectedConv) {
            console.log('Preserving conversational hint state for conversation:', selectedId);
          }
        }
        return newConversations;
      });
      
      const trashed = await aiConversationService.getAllConversations({ deleted: true });
      setTrashedConversations(trashed);
    } catch {
      setError('Failed to refresh conversations.');
    }
  };

  // Soft delete specific conversation
  const handleDeleteConversation = async (conversationId) => {
    const result = await Swal.fire({
      title: 'Delete Conversation?',
      text: 'This will move the conversation to Trash. You can restore it later.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, move to Trash',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await aiConversationService.softDeleteConversation(conversationId);
        await Swal.fire('Deleted!', 'Conversation moved to Trash.', 'success');
        await refetchConversations();
      } catch {
        setError('Failed to delete conversation.');
      }
    }
  };

  // Restore conversation from Trash
  const handleRestoreConversation = async (conversationId) => {
    try {
      await aiConversationService.restoreConversation(conversationId);
      await Swal.fire('Restored!', 'Conversation has been restored.', 'success');
      await refetchConversations();
    } catch {
      setError('Failed to restore conversation.');
    }
  };

  // Restore all conversations from Trash
  const handleRestoreAllConversations = async () => {
    let success = false;
    try {
      await aiConversationService.restoreAllConversations();
      success = true;
      await refetchConversations();
    } catch {
      setError('Failed to restore all conversations.');
    } finally {
      if (success) {
        await Swal.fire('Restored!', 'All conversations have been restored.', 'success');
      } else {
        await Swal.fire('Error', 'Failed to restore all conversations.', 'error');
      }
    }
  };

  // Permanently delete a single conversation from Trash
  const handlePermanentDelete = async (conversationId) => {
    const result = await Swal.fire({
      title: 'Delete Forever?',
      text: 'This will permanently delete the conversation. This action cannot be undone.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete Forever',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      try {
        await aiConversationService.permanentDeleteConversation(conversationId);
        await Swal.fire('Deleted!', 'Conversation permanently deleted.', 'success');
        await refetchConversations();
      } catch {
        setError('Failed to permanently delete conversation.');
      }
    }
  };

  // Permanently delete all trashed conversations
  const handlePermanentDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Delete All Forever?',
      text: 'This will permanently delete all trashed conversations. This action cannot be undone.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete All Forever',
      cancelButtonText: 'Cancel'
    });
    let success = false;
    if (result.isConfirmed) {
      try {
        await aiConversationService.permanentDeleteAllConversations();
        success = true;
        await refetchConversations();
      } catch {
        setError('Failed to permanently delete all conversations.');
      } finally {
        if (success) {
          await Swal.fire('Deleted!', 'All trashed conversations permanently deleted.', 'success');
        } else {
          await Swal.fire('Error', 'Failed to permanently delete all conversations.', 'error');
        }
      }
    }
  };

  // Clear all conversations and localStorage
  const handleClearAllConversations = async () => {
    let success = false;
    const result = await Swal.fire({
      title: 'Clear All Conversations?',
      text: 'This will move all your conversations to Trash. You can restore them later.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, move all to Trash',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setConversations(prev => prev.map(c => c.deleted ? c : { ...c, deleted: true }));
        setSelectedId(null);
        await aiConversationService.softDeleteAllConversations();
        await refetchConversations();
        success = true;
      } catch {
        setError('Failed to clear conversations.');
      } finally {
        if (success) {
          await Swal.fire('Deleted!', 'All conversations have been moved to Trash.', 'success');
        } else {
          await Swal.fire('Error', 'Failed to clear conversations.', 'error');
        }
      }
    }
  };

  // Filter conversations for main and trash views
  const visibleConversations = conversations.filter(c => !c.deleted);

  // Export JSON structure (currently unused but kept for future use)
  const _handleExportJson = () => {
    if (!selectedConv?.testData) {
      Swal.fire('No Data', 'No test data available to export.', 'info');
      return;
    }
    setJsonExportData(selectedConv.testData);
    setActivePanel('json');
  };

  // Download JSON file (currently unused but kept for future use)
  const _handleDownloadJson = () => {
    if (!jsonExportData) return;

    const dataStr = JSON.stringify(jsonExportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_${selectedConv?.id || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload JSON file
  const handleUploadJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setJsonExportData(jsonData);

        // Update the current conversation with the uploaded data
        if (selectedConv) {
          setConversations(prev =>
            prev.map(c =>
              c.id === selectedId
                ? { ...c, testData: jsonData }
                : c
            )
          );
        }

        Swal.fire('Success', 'JSON file uploaded successfully!', 'success');
      } catch {
        Swal.fire('Error', 'Invalid JSON file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!selectedConv?.testData) {
      Swal.fire('No Data', 'No test data available to save.', 'info');
      return;
    }

    console.log('Saving draft for conversation:', selectedConv.id);
    console.log('Conversation data:', selectedConv);
    console.log('Test data:', selectedConv.testData);

    setSavingDraft(true);
    try {
      const backendResult = await aiConversationService.saveDraft(selectedConv.id);

      if (backendResult.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Draft Saved!',
          text: backendResult.message,
          confirmButtonText: 'View Test',
          showCancelButton: true,
          cancelButtonText: 'Stay Here'
        }).then((swalResult) => {
          if (swalResult.isConfirmed) {
            window.open(`/edittest/${backendResult.test_slug}`, '_blank');
          }
        });
      } else {
        Swal.fire('Error', backendResult.error || 'Failed to save draft.', 'error');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      Swal.fire('Error', error.response?.data?.error || 'Failed to save draft.', 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  // Update conversation title
  const handleUpdateConversationTitle = async (conversationId, newTitle) => {
    try {
      const result = await aiConversationService.updateConversationTitle(conversationId, newTitle);
      
      if (result.success) {
        // Update the conversation in the local state
        setConversations(prev =>
          prev.map(c =>
            c.id === conversationId
              ? { ...c, testTitle: newTitle }
              : c
          )
        );
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Title Updated!',
          text: 'Conversation title has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
        });
      } else {
        throw new Error(result.error || 'Failed to update title');
      }
    } catch (error) {
      console.error('Update title error:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  // Copy conversation link
  const handleCopyLink = () => {
    if (!selectedConv) return;

    const link = `${window.location.origin}/ai-conversation?id=${selectedConv.id}`;
    navigator.clipboard.writeText(link).then(() => {
      Swal.fire('Copied!', 'Conversation link copied to clipboard.', 'success');
    });
  };

  // Handle width control
  const handleWidthControl = (size) => {
    switch (size) {
      case 'narrow':
        setPanelWidth(280);
        setChatPanelPercent(null);
        setPreviewPanelPercent(null);
        break;
      case 'medium':
        setPanelWidth(384);
        setChatPanelPercent(null);
        setPreviewPanelPercent(null);
        break;
      case 'wide':
        setPanelWidth(600);
        setChatPanelPercent(null);
        setPreviewPanelPercent(null);
        break;
      case 'chat20': {
        setChatPanelPercent(20);
        setPreviewPanelPercent(80);
        break;
      }
      case 'preview80': {
        setChatPanelPercent(20);
        setPreviewPanelPercent(80);
        break;
      }
      case 'fifty50': {
        setChatPanelPercent(50);
        setPreviewPanelPercent(50);
        break;
      }
      default:
        setPanelWidth(384);
        setChatPanelPercent(null);
        setPreviewPanelPercent(null);
    }
  };

  // Handle panel resize
  const handlePanelResize = (newWidth) => {
    setPanelWidth(newWidth);
  };

  // Add a useEffect to show Swal for errors
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error,
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
      });
      setError(''); // Clear error after showing
    }
  }, [error]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Sidebar (collapsible) */}
      {sidebarVisible && (
        <SidebarAI
          tabb="ai-conversation"
          onCollapse={() => setSidebarVisible(false)}
        />
      )}

      {/* Conversation List Sidebar */}
      <div className={`${isMobile ? (showConversationList ? 'flex' : 'hidden') : 'flex'} flex-col ${isMobile ? 'w-full max-w-sm' : 'w-80 min-w-[260px] max-w-xs'} border-r border-gray-200 bg-white lg:flex`} data-tour-id="conversation-list">
        {/* Header with Trash toggle */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
          {isMobile && (
            <button
              onClick={() => setShowConversationList(false)}
              className="p-2 rounded hover:bg-gray-100 lg:hidden"
              title="Close Conversations"
              aria-label="Close Conversations"
            >
              <X size={20} />
            </button>
          )}
          <button
            onClick={() => setSidebarVisible(true)}
            className="p-2 rounded hover:bg-gray-100"
            title="Show Main Sidebar"
            aria-label="Show Main Sidebar"
          >
            <LucideMenu size={22} />
          </button>
          <span className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Conversations</span>
          {!isMobile && (
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="ml-auto p-2 rounded hover:bg-gray-100"
              title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              aria-label="Toggle View Mode"
            >
              {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
            </button>
          )}
          <button
            onClick={() => setConversationMenuOpen((v) => !v)}
            className={`${!isMobile ? '' : 'ml-auto'} p-2 rounded hover:bg-gray-100`}
            title="More Options"
            aria-label="More Options"
          >
            <MoreVertical size={20} />
          </button>
          <button
            onClick={() => setShowTrash((v) => !v)}
            className={`p-2 rounded ${showTrash ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
            title={showTrash ? 'Show Conversations' : 'Show Trash'}
            aria-label="Toggle Trash"
          >
            <Trash2 size={20} />
          </button>
        </div>
        {/* Conversation List or Trash List */}
        <div className="flex-1 overflow-y-auto">
          {!showTrash ? (
            <ConversationList
              conversations={visibleConversations}
              selectedId={selectedId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onClearAll={handleClearAllConversations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              conversationMenuOpen={conversationMenuOpen}
              onConversationMenuToggle={setConversationMenuOpen}
              isMobile={isMobile}
              onMobileToggle={setShowConversationList}
              onUpdateConversationTitle={handleUpdateConversationTitle}
              tourEnabled={true}
            />
          ) : (
            <ConversationList
              conversations={trashedConversations}
              selectedId={selectedId}
              onSelectConversation={handleSelectConversation}
              onRestoreConversation={handleRestoreConversation}
              onRestoreAll={handleRestoreAllConversations}
              onPermanentDelete={handlePermanentDelete}
              onPermanentDeleteAll={handlePermanentDeleteAll}
              isTrashView={true}
              conversationMenuOpen={conversationMenuOpen}
              onConversationMenuToggle={setConversationMenuOpen}
              isMobile={isMobile}
              onMobileToggle={setShowConversationList}
              onUpdateConversationTitle={handleUpdateConversationTitle}
            />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-row min-h-0 transition-all duration-300">
        {/* Chat/Main Area */}
        <div
          className={`flex-1 flex flex-col min-h-0 ${isMobile && (activePanel === 'preview' || activePanel === 'json') ? 'hidden' : ''}`}
          style={!isMobile && chatPanelPercent ? { flexBasis: `${chatPanelPercent}%`, maxWidth: `${chatPanelPercent}%`, minWidth: 300 } : {}}
        >
          {/* Top Toolbar */}
          <ChatToolbar
            selectedConv={selectedConv}
            activePanel={activePanel}
            onPanelChange={setActivePanel}
            onNewConversation={handleNewConversation}
            onSaveDraft={handleSaveDraft}
            onCopyLink={handleCopyLink}
            onFullPreview={() => setFullPreviewOpen(true)}
            onRefresh={handleRefreshConversation}
            onMobileToggle={() => setShowConversationList(true)}
            isMobile={isMobile}
            savingDraft={savingDraft}
            onWidthControl={handleWidthControl}
            isNarrow={!!chatPanelPercent && chatPanelPercent <= 20}
            aiTaskQueue={aiTaskQueue}
            jobsDropdownOpen={jobsDropdownOpen}
            setJobsDropdownOpen={setJobsDropdownOpen}
            expandedMessages={expandedMessages}
            setExpandedMessages={setExpandedMessages}
            onCancelAiTask={handleCancelAiTask}
            onShowHint={() => setShowConversationalHint(true)}
            tourEnabled={true}
          />
          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
            {selectedConv ? (
              <div className="flex-1 flex flex-col justify-between h-full min-h-0">
                <div className={`flex-1 flex flex-col space-y-4 overflow-y-auto scrollbar-hide ${isMobile ? 'px-3 pt-4 pb-0' : 'px-4 pt-6 pb-0'}`}>
                  {/* Show conversational hint for new conversations */}
                  {showConversationalHint && (
                    <div data-tour-id="conversational-hint">
                      {console.log('Rendering conversational hint, showConversationalHint:', showConversationalHint)}
                      <ConversationalHint 
                        onClose={() => setShowConversationalHint(false)}
                        onUseExample={handleUseExample}
                      />
                    </div>
                  )}
                  
                  {selectedConv.messages && selectedConv.messages.length > 0 ? (
                    selectedConv.messages.map((msg, idx) => (
                      <div
                        key={`${selectedConv.id}-${msg.timestamp}-${msg.sender}-${idx}`}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`${isMobile ? 'max-w-[95%]' : 'max-w-[85%] lg:max-w-[80%]'} ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          } ${!!chatPanelPercent && chatPanelPercent <= 20 ? 'text-xs px-2 py-2' : ''}`}
                        >
                          <div className={`flex items-center gap-2 font-medium mb-1 ${isMobile ? 'text-xs' : (!!chatPanelPercent && chatPanelPercent <= 20 ? 'text-xs' : 'text-sm')}`}>
                            {msg.sender === 'user' ? (
                              <>
                                <User size={isMobile ? 12 : 14} />
                                You
                              </>
                            ) : (
                              <>
                                <Bot size={isMobile ? 12 : 14} />
                                AI Assistant
                              </>
                            )}
                          </div>
                          <div className={`whitespace-pre-wrap ${isMobile ? 'text-sm' : (!!chatPanelPercent && chatPanelPercent <= 20 ? 'text-xs' : 'text-sm lg:text-base')}`}>
                            {msg.text.length > 200 && !expandedMessages.has(`${selectedConv.id}-${msg.timestamp}-${msg.sender}-${idx}`) ? (
                              <>
                                <div className="max-h-32 overflow-hidden">
                                  {msg.text.substring(0, 200)}...
                                </div>
                                <button 
                                  className="text-blue-500 hover:text-blue-700 text-xs font-medium mt-1 flex items-center gap-1"
                                  onClick={() => setExpandedMessages(prev => new Set([...prev, `${selectedConv.id}-${msg.timestamp}-${msg.sender}-${idx}`]))}
                                >
                                  Show full message <ChevronDown size={12} />
                                </button>
                              </>
                            ) : msg.text.length > 200 && expandedMessages.has(`${selectedConv.id}-${msg.timestamp}-${msg.sender}-${idx}`) ? (
                              <>
                                <div>{msg.text}</div>
                                <button 
                                  className="text-blue-500 hover:text-blue-700 text-xs font-medium mt-1 flex items-center gap-1"
                                  onClick={() => {
                                    const newSet = new Set(expandedMessages);
                                    newSet.delete(`${selectedConv.id}-${msg.timestamp}-${msg.sender}-${idx}`);
                                    setExpandedMessages(newSet);
                                  }}
                                >
                                  Show less <ChevronUp size={12} />
                                </button>
                              </>
                            ) : (
                              <div>{msg.text}</div>
                            )}
                          </div>
                          {msg.timestamp && (
                            <div className={`opacity-70 mt-2 ${isMobile ? 'text-[10px]' : (!!chatPanelPercent && chatPanelPercent <= 20 ? 'text-[10px]' : 'text-xs')}`}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                          {/* Associated AI Jobs */}
                          {msg.sender === 'ai' && msg.ai_task_ids && msg.ai_task_ids.length > 0 && (
                            <div className={`ai-job-list bg-gray-50 border-l-4 border-blue-200 pl-3 mt-2 mb-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                              <div className="font-semibold mb-1 text-blue-700">Associated Jobs:</div>
                              {msg.ai_task_ids.map(taskId => {
                                const job = (aiTaskQueue || []).flatMap(parent => parent.children || []).find(j => j.id === taskId);
                                return job ? (
                                  <div key={job.id} className="flex items-center gap-2">
                                    <span className="font-mono">{job.job_name || `Job ${job.id}`}</span>
                                    <span className={
                                      job.status === 'done' ? 'text-green-600' :
                                      job.status === 'failed' ? 'text-red-600' :
                                      job.status === 'processing' ? 'text-blue-600' :
                                      'text-gray-500'
                                    }>
                                      {job.status}
                                    </span>
                                    {job.error && <span className="text-red-500 ml-2">({job.error})</span>}
                                  </div>
                                ) : (
                                  <div key={taskId} className="text-gray-400">Job {taskId} (not found)</div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bot className="mx-auto text-gray-400 mb-4" size={48} />
                      <div className="text-gray-500 text-lg mb-2">
                        Start your conversation!
                      </div>
                      <div className="text-gray-400 text-sm">
                        Ask the AI to create or modify your test
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="flex justify-start">
                      <div className={`bg-white text-gray-900 rounded-2xl border border-gray-200 ${isMobile ? 'px-3 py-2 text-sm' : (!!chatPanelPercent && chatPanelPercent <= 20 ? 'px-2 py-2 text-xs' : 'px-4 py-3')}`}>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <div className="flex-1">
                          <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>{loadingMessage || "AI is processing your request..."}</span>
                            {loadingMessage && loadingMessage.length > 100 && (
                              <button 
                                className="text-blue-500 hover:text-blue-700 text-xs font-medium ml-2 flex items-center gap-1"
                                onClick={() => {
                                  const loadingKey = 'loading-message';
                                  if (expandedMessages.has(loadingKey)) {
                                    const newSet = new Set(expandedMessages);
                                    newSet.delete(loadingKey);
                                    setExpandedMessages(newSet);
                                  } else {
                                    setExpandedMessages(prev => new Set([...prev, loadingKey]));
                                  }
                                }}
                              >
                                {expandedMessages.has('loading-message') ? (
                                  <>Show less <ChevronUp size={12} /></>
                                ) : (
                                  <>Show full <ChevronDown size={12} /></>
                                )}
                              </button>
                                    )}
                                  </div>
                                </div>
                        {loadingMessage && loadingMessage.length > 100 && expandedMessages.has('loading-message') && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {loadingMessage}
                          </div>
                                )}
                              </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div data-tour-id="chat-input">
                  <ChatInput
                    input={input}
                    onInputChange={(e) => setInput(e.target.value)}
                    onSend={handleSend}
                    loading={loading}
                    disabled={tokenErrorType === 'empty'}
                    onFileUpload={handleFileUpload}
                    onVoiceRecord={handleVoiceRecord}
                    placeholder="Type your message..."
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                  <MessageSquare className={`mx-auto text-gray-400 mb-4 ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} size={isMobile ? 48 : 64} />
                  <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    Welcome to AI Test Creation!
                  </h3>
                  <p className={`text-gray-500 mb-6 ${isMobile ? 'text-sm' : ''}`}>
                    Start your first conversation to create amazing tests with AI assistance
                  </p>
                  
                  {/* Show conversational hint for first-time users */}
                  {conversations.length === 0 && (
                    <div className="mb-6">
                      <ConversationalHint 
                        onClose={() => {}} // No close button for empty state
                        onUseExample={(example) => {
                          handleNewConversation();
                          // Set the example as input after conversation is created
                          setTimeout(() => setInput(example), 1500);
                        }}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={handleNewConversation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus size={isMobile ? 14 : 16} />
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {activePanel === 'preview' && selectedConv && (
          <>
            {!isMobile && (
              <ResizableDivider 
                onResize={handlePanelResize}
                minWidth={280}
                maxWidth={800}
                position="left"
              />
            )}
            <div
              className={`bg-white border-l border-gray-200 flex flex-col min-h-0 ${isMobile ? 'w-full h-full' : ''}`}
              style={!isMobile && previewPanelPercent ? { flexBasis: `${previewPanelPercent}%`, maxWidth: `${previewPanelPercent}%` } : (!isMobile ? { width: `${panelWidth}px` } : {})}
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => {
                          setActivePanel('chat');
                          setChatPanelPercent(null);
                          setPreviewPanelPercent(null);
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Back to Chat"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>Test Preview</h3>
                  </div>
                  {!isMobile && (
                    <button
                      onClick={() => {
                        setActivePanel('chat');
                        setChatPanelPercent(null);
                        setPreviewPanelPercent(null);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoaderCircle className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : selectedConv.testData ? (
                  <>
                    {console.log('Preview testData:', selectedConv.testData)}
                    {console.log('Selected conversation:', selectedConv)}
                    <TestFullPreview test={selectedConv.testData} />
                  </>
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    <div className="mb-2">No test data available</div>
                    <div className="text-sm">
                      {selectedConv ?
                        `Conversation ID: ${selectedConv.id}, Messages: ${selectedConv.messages?.length || 0}` :
                        'No conversation selected'
                      }
                    </div>
                    <div className="text-xs mt-2 mb-4">
                      Try asking the AI to create a test first
                    </div>
                    {selectedConv && (
                      <button
                        onClick={() => {
                          console.log('Current conversation data:', selectedConv);
                          console.log('testData:', selectedConv.testData);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Debug Data
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* JSON Panel */}
        {activePanel === 'json' && (
          <>
            {!isMobile && (
              <ResizableDivider 
                onResize={handlePanelResize}
                minWidth={280}
                maxWidth={800}
                position="left"
              />
            )}
            <div
              className={`bg-white border-l border-gray-200 flex flex-col min-h-0 ${isMobile ? 'w-full h-full' : ''}`}
              style={!isMobile && previewPanelPercent ? { flexBasis: `${previewPanelPercent}%`, maxWidth: `${previewPanelPercent}%` } : (!isMobile ? { width: `${panelWidth}px` } : {})}
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => {
                          setActivePanel('chat');
                          setChatPanelPercent(null);
                          setPreviewPanelPercent(null);
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Back to Chat"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>JSON Structure</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Download button hidden for now */}
                    {/* <button
                      onClick={handleDownloadJson}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                      title="Download JSON"
                    >
                      <Download size={16} />
                    </button> */}
                    <label className={`p-1 text-gray-500 hover:text-gray-700 rounded cursor-pointer ${isMobile ? 'p-2' : ''}`} title="Upload JSON">
                      <Upload size={isMobile ? 20 : 16} />
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleUploadJson}
                        className="hidden"
                      />
                    </label>
                    {!isMobile && (
                      <button
                        onClick={() => {
                          setActivePanel('chat');
                          setChatPanelPercent(null);
                          setPreviewPanelPercent(null);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {jsonExportData ? (
                  <JsonStructureViewer data={jsonExportData} />
                ) : (
                  <div className="text-center text-gray-500">
                    No JSON data available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Full Preview Modal */}
      {fullPreviewOpen && selectedConv && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0">
          <div className="bg-white w-full h-full flex flex-col">
            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide w-full h-full p-0">
              {selectedConv.testData ? (
                <div className="w-full h-full">
                  {/* Title with icons */}
                  <div className="flex items-center justify-between mb-6 w-full px-6 pt-6">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setFullPreviewOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <ChevronLeft size={20} />
                        <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Back</span>
                      </button>
                      <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}
                        style={{lineHeight: 1}}>
                        {selectedConv.testData?.title || selectedConv.testTitle || 'Test Preview'}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFullPreviewOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Close Preview"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={() => setFullPreviewOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Block/Full Screen"
                      >
                        <Square size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-[calc(100%-64px)] flex flex-col">
                    <TestFullPreview test={selectedConv.testData} className="w-full h-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12 w-full h-full flex items-center justify-center">
                  <div>
                    <div className={`mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No test data available</div>
                    <div className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Try asking the AI to create a test first</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Tour */}
      <Joyride
        steps={tourSteps}
        run={tourOpen}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableScrolling={true}
        spotlightClicks={true}
        styles={{
          options: { zIndex: 10000 },
          overlay: { zIndex: 9999 },
          tooltip: { zIndex: 10001, maxHeight: 300, overflowY: 'auto' }
        }}
        callback={data => {
          if (data.status === 'finished' || data.status === 'skipped') setTourOpen(false);
        }}
      />
      {tokenErrorType === 'empty' && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded flex items-center justify-between mb-4">
          <span>
            <strong>Insufficient Tokens:</strong> {tokenWarning}
          </span>
          <button
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded"
            onClick={() => window.location.href = '/account?alert=purchase_tokens'}
          >
            Buy Tokens
          </button>
        </div>
      )}
      {tokenErrorType === 'low' && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded flex items-center justify-between mb-4">
          <span>
            <strong>Low Token Balance:</strong> {tokenWarning}
          </span>
          <button
            className="ml-4 bg-yellow-600 text-white px-3 py-1 rounded"
            onClick={() => window.location.href = '/account?alert=purchase_tokens'}
          >
            Buy Tokens
          </button>
        </div>
      )}
    </div>
  );
};

export default AiConversation;  
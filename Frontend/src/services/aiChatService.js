import axios from 'axios';
import cacheService from './cacheService';
import cacheDebugger from '../utils/cacheDebugger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Utility function to generate message hash for caching
const generateMessageHash = (message, conversationId) => {
  const str = `${conversationId}:${message}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

class AIChatService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Check if current route is the home page
          const currentPath = window.location.pathname;
          if (currentPath !== '/') {
            // Handle unauthorized access for all routes except home page
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Result AI Chat methods
  async sendResultMessage(message, conversationId, testId) {
    const messageHash = generateMessageHash(message, conversationId);
    
    // Check cache first
    const cachedResponse = cacheService.getCachedAIResponse(conversationId, messageHash);
    if (cachedResponse) {
      cacheDebugger.log('hit', { conversationId, messageHash });
      return cachedResponse;
    }
    cacheDebugger.log('miss', { conversationId, messageHash });

    try {
      const response = await this.axiosInstance.post('/result_ai_chat', {
        message,
        conversation_id: conversationId,
        test_id: testId
      });

      const result = {
        reply: response.data.reply,
        conversation_id: response.data.conversation_id,
        token_count: response.data.token_count,
        wallet_balance: response.data.wallet_balance
      };

      // Cache the response
      cacheService.cacheAIResponse(conversationId, messageHash, result);
      
      return result;
    } catch (error) {
      if (error.response?.status === 402) {
        throw new Error('Insufficient tokens. Please add balance to your wallet to continue using the AI chat.');
      }
      throw error;
    }
  }

  async syncResultData(testId, conversationId) {
    // Check cache first
    const cachedData = cacheService.getCachedContextData(testId);
    if (cachedData) {
      console.log('Using cached context data');
      return cachedData;
    }

    const response = await this.axiosInstance.post('/result_ai_chat/sync', {
      test_id: testId,
      conversation_id: conversationId,
    });

    const result = {
      success: response.data.success,
      conversation_id: response.data.conversation_id,
      message: response.data.message
    };

    // Cache the context data
    cacheService.cacheContextData(testId, result);
    
    return result;
  }

  async findOrCreateConversation(testId = null) {
    const response = await this.axiosInstance.post('/ai_chat/find_or_create', testId ? { test_id: testId } : {});
    return response.data;
  }

  async resetResultConversation(testId) {
    const response = await this.axiosInstance.post('/result_ai_chat/reset', {
      test_id: testId
    });

    // Invalidate related caches
    cacheService.invalidateConversation(testId);
    cacheService.invalidateContextData(testId);

    return {
      success: response.data.success,
      conversation_id: response.data.conversation_id,
      message: response.data.message
    };
  }

  // Regular AI Chat methods
  async sendMessage(message, conversationId) {
    const response = await this.axiosInstance.post('/ai_chat', {
      message,
      conversation_id: conversationId
    });
    return response.data;
  }

  async resetConversation() {
    const response = await this.axiosInstance.post('/ai_chat/reset');
    
    // Clear all conversation-related caches
    cacheService.clearAll();
    
    return {
      success: response.data.success,
      conversation_id: response.data.conversation_id
    };
  }

  async getConversationState(conversationId) {
    const response = await this.axiosInstance.get(`/ai_chat/conversation_state?conversation_id=${conversationId}`);
    return response.data;
  }

  // File upload for AI processing
  async uploadFile(file, conversationId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', conversationId);

    console.log('Making upload request to:', `${this.axiosInstance.defaults.baseURL}/tests_process/upload_file`);
    console.log('FormData contents:', { file: file.name, conversationId });

    const response = await this.axiosInstance.post('/tests_process/upload_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout for file upload
    });

    console.log('Upload response:', response);
    return response.data;
  }

  // Upload JSON file for test processing
  async uploadJsonFile(file, conversationId, message = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversation_id', conversationId);
      if (message) {
        formData.append('message', message);
      }

      const response = await this.axiosInstance.post('/api/v1/ai_chat/upload_json_file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('JSON file upload error:', error);
      throw error;
    }
  }

  // Export test structure as JSON file
  async exportTestJson(conversationId) {
    try {
      const response = await this.axiosInstance.get(`/api/v1/ai_chat/export_test_json`, {
        params: { conversation_id: conversationId },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test_${conversationId}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  }

  // Cache management methods
  invalidateTestCache(testId) {
    cacheService.invalidateTestData(testId);
    cacheService.invalidateContextData(testId);
  }

  invalidateConversationCache(conversationId) {
    cacheService.invalidateConversation(conversationId);
  }

  clearAllCaches() {
    cacheService.clearAll();
  }

  getCacheStats() {
    return cacheService.getStats();
  }

  // Preload data for better performance
  async preloadTestData(testId) {
    try {
      // Preload test data if not cached
      if (!cacheService.getCachedTestData(testId)) {
        const response = await this.axiosInstance.get(`/tests/${testId}`);
        cacheService.cacheTestData(testId, response.data);
      }

      // Preload context data if not cached
      if (!cacheService.getCachedContextData(testId)) {
        await this.syncResultData(testId);
      }
    } catch (error) {
      console.warn('Failed to preload test data:', error);
    }
  }

  // List all conversations for the user
  async getAllConversations() {
    const response = await this.axiosInstance.get('/ai_chat/conversations');
    return response.data.conversations;
  }

  // Get messages and test data for a conversation
  async getConversationDetails(conversationId) {
    const response = await this.axiosInstance.get(`/ai_chat/conversation_state?conversation_id=${conversationId}`);
    return response.data;
  }
}

// Create singleton instance
const aiChatService = new AIChatService();

export default aiChatService; 
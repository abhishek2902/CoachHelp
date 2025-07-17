import axios from 'axios';

class AIConversationService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

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
            localStorage.removeItem('tpuser');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Send a message to the AI conversation
  async sendMessage(message, conversationId) {
    const response = await this.axiosInstance.post('/ai_conversation', {
      message,
      conversation_id: conversationId
    });
    return response.data;
  }

  // Reset conversation and create a new one
  async resetConversation() {
    const response = await this.axiosInstance.post('/ai_conversation/reset');
    return response.data;
  }

  // Find or create a conversation
  async findOrCreateConversation() {
    const response = await this.axiosInstance.post('/ai_conversation/find_or_create');
    return response.data;
  }

  // Get all conversations for the user
  async getAllConversations({ deleted = false, type = null } = {}) {
    let url = '/ai_conversation/conversations';
    const params = [];
    if (type) params.push(`conversation_type=${type}`);
    if (deleted) params.push('deleted=true');
    if (params.length) url += '?' + params.join('&');
    const response = await this.axiosInstance.get(url);
    return response.data.conversations;
  }

  // Get conversation state and messages
  async getConversationState(conversationId) {
    const response = await this.axiosInstance.get(`/ai_conversation/conversation_state?conversation_id=${conversationId}`);
    return response.data;
  }

  // Get conversation details with messages
  async getConversationDetails(conversationId) {
    const response = await this.axiosInstance.get(`/ai_conversation/conversation_state?conversation_id=${conversationId}`);
    return response.data;
  }

  // Soft delete all conversations (bulk)
  async softDeleteAllConversations() {
    const response = await this.axiosInstance.post('/ai_conversation/soft_delete_all');
    return response.data;
  }

  // Soft delete a single conversation
  async softDeleteConversation(conversationId) {
    const response = await this.axiosInstance.post(`/ai_conversation/${conversationId}/soft_delete`);
    return response.data;
  }

  // Restore a single conversation
  async restoreConversation(conversationId) {
    const response = await this.axiosInstance.post(`/ai_conversation/${conversationId}/restore`);
    return response.data;
  }

  // Restore all deleted conversations
  async restoreAllConversations() {
    const response = await this.axiosInstance.post('/ai_conversation/restore_all');
    return response.data;
  }

  // Permanently delete a single conversation
  async permanentDeleteConversation(conversationId) {
    const response = await this.axiosInstance.delete(`/ai_conversation/${conversationId}/permanent_delete`);
    return response.data;
  }

  // Permanently delete all trashed conversations
  async permanentDeleteAllConversations() {
    const response = await this.axiosInstance.delete('/ai_conversation/permanent_delete_all');
    return response.data;
  }

  // Save conversation as draft test
  async saveDraft(conversationId) {
    const response = await this.axiosInstance.post(`/ai_conversation/${conversationId}/save_draft`);
    return response.data;
  }

  // Update conversation title
  async updateConversationTitle(conversationId, newTitle) {
    const response = await this.axiosInstance.patch(`/ai_conversation/${conversationId}`, {
      test_title: newTitle
    });
    return response.data;
  }

  // Poll AiTask status/result
  async getAiTaskStatus(aiTaskId) {
    const response = await this.axiosInstance.get(`/ai_tasks/${aiTaskId}`);
    return response.data;
  }

  // Get all AiTasks for a conversation
  async getAiTasksForConversation(conversationId) {
    const response = await this.axiosInstance.get(`/ai_conversation/${conversationId}/ai_tasks`);
    return response.data;
  }

  // Cancel an AiTask
  async cancelAiTask(aiTaskId) {
    const response = await this.axiosInstance.post(`/ai_tasks/${aiTaskId}/cancel`);
    return response.data;
  }

  // Create AiTask for large/batched requests (deprecated - AI now decides dynamically)
  async createAiTask(conversationId, messagePayload) {
    console.warn('createAiTask is deprecated - AI now decides processing method dynamically');
    const response = await this.axiosInstance.post(`/ai_conversation/${conversationId}/ai_task`, {
      message: JSON.stringify(messagePayload)
    });
    return response.data;
  }

  // Upload file for AI processing
  async uploadFile(formData) {
    const response = await this.axiosInstance.post('/ai_conversation/upload_file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout for file upload
    });
    return response.data;
  }
}

// Create singleton instance
const aiConversationService = new AIConversationService();

export default aiConversationService; 
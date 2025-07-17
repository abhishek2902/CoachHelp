// Cache Service for AI Chat Feature
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.cacheConfig = {
      // Cache durations in milliseconds
      aiResponse: 30 * 60 * 1000, // 30 minutes
      testData: 5 * 60 * 1000,    // 5 minutes
      contextData: 10 * 60 * 1000, // 10 minutes
      userData: 60 * 60 * 1000,   // 1 hour
      conversation: 24 * 60 * 60 * 1000, // 24 hours
    };
  }

  // Generate cache key
  generateKey(prefix, ...params) {
    return `${prefix}:${params.join(':')}`;
  }

  // Memory cache operations
  setMemory(key, value, ttl = null) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.cacheConfig.aiResponse
    };
    this.memoryCache.set(key, item);
  }

  getMemory(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value;
  }

  // LocalStorage operations with TTL
  setLocal(key, value, ttl = null) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl || this.cacheConfig.userData
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage set failed:', error);
    }
  }

  getLocal(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('LocalStorage get failed:', error);
      return null;
    }
  }

  // SessionStorage operations with TTL
  setSession(key, value, ttl = null) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: ttl || this.cacheConfig.testData
      };
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('SessionStorage set failed:', error);
    }
  }

  getSession(key) {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.ttl) {
        sessionStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('SessionStorage get failed:', error);
      return null;
    }
  }

  // AI Chat specific cache methods
  cacheAIResponse(conversationId, messageHash, response) {
    const key = this.generateKey('ai_response', conversationId, messageHash);
    this.setMemory(key, response, this.cacheConfig.aiResponse);
  }

  getCachedAIResponse(conversationId, messageHash) {
    const key = this.generateKey('ai_response', conversationId, messageHash);
    return this.getMemory(key);
  }

  cacheTestData(testId, data) {
    const key = this.generateKey('test_data', testId);
    this.setSession(key, data, this.cacheConfig.testData);
  }

  getCachedTestData(testId) {
    const key = this.generateKey('test_data', testId);
    return this.getSession(key);
  }

  cacheContextData(testId, data) {
    const key = this.generateKey('context_data', testId);
    this.setMemory(key, data, this.cacheConfig.contextData);
  }

  getCachedContextData(testId) {
    const key = this.generateKey('context_data', testId);
    return this.getMemory(key);
  }

  cacheConversation(conversationId, data) {
    const key = this.generateKey('conversation', conversationId);
    this.setLocal(key, data, this.cacheConfig.conversation);
  }

  getCachedConversation(conversationId) {
    const key = this.generateKey('conversation', conversationId);
    return this.getLocal(key);
  }

  // Cache invalidation methods
  invalidateTestData(testId) {
    const key = this.generateKey('test_data', testId);
    sessionStorage.removeItem(key);
    this.memoryCache.delete(key);
  }

  invalidateContextData(testId) {
    const key = this.generateKey('context_data', testId);
    this.memoryCache.delete(key);
  }

  invalidateConversation(conversationId) {
    const key = this.generateKey('conversation', conversationId);
    localStorage.removeItem(key);
    
    // Also invalidate all AI responses for this conversation
    for (const [cacheKey] of this.memoryCache) {
      if (cacheKey.startsWith(`ai_response:${conversationId}:`)) {
        this.memoryCache.delete(cacheKey);
      }
    }
  }

  // Clear all caches
  clearAll() {
    this.memoryCache.clear();
    
    // Clear localStorage items that match our pattern
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ai_response:') || key.startsWith('conversation:') || key.startsWith('test_data:') || key.startsWith('context_data:'))) {
        localStorage.removeItem(key);
      }
    }

    // Clear sessionStorage items that match our pattern
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('ai_response:') || key.startsWith('conversation:') || key.startsWith('test_data:') || key.startsWith('context_data:'))) {
        sessionStorage.removeItem(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const memorySize = this.memoryCache.size;
    let localStorageSize = 0;
    let sessionStorageSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ai_response:') || key.startsWith('conversation:') || key.startsWith('test_data:') || key.startsWith('context_data:'))) {
        localStorageSize++;
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('ai_response:') || key.startsWith('conversation:') || key.startsWith('test_data:') || key.startsWith('context_data:'))) {
        sessionStorageSize++;
      }
    }

    return {
      memory: memorySize,
      localStorage: localStorageSize,
      sessionStorage: sessionStorageSize
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService; 
// Cache Debugger Utility
// This utility helps debug and monitor cache performance

import aiChatService from '../services/aiChatService';

class CacheDebugger {
  constructor() {
    this.isEnabled = import.meta.env.MODE === 'development';
    this.logs = [];
    this.maxLogs = 100;
  }

  // Enable/disable debug logging
  enable() {
    this.isEnabled = true;
    console.log('🔍 Cache debugger enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('🔍 Cache debugger disabled');
  }

  // Log cache events
  log(event, data = {}) {
    if (!this.isEnabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      memoryUsage: this.getMemoryUsage()
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with emoji indicators
    const emoji = this.getEventEmoji(event);
    console.log(`${emoji} Cache ${event}:`, data);
  }

  // Get emoji for different events
  getEventEmoji(event) {
    const emojis = {
      'hit': '✅',
      'miss': '❌',
      'set': '💾',
      'invalidate': '🗑️',
      'clear': '🧹',
      'error': '⚠️',
      'preload': '🚀'
    };
    return emojis[event] || '📝';
  }

  // Get current memory usage
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  // Get cache statistics
  getStats() {
    const stats = aiChatService.getCacheStats();
    const memoryUsage = this.getMemoryUsage();
    
    return {
      cache: stats,
      memory: memoryUsage,
      logs: this.logs.length,
      enabled: this.isEnabled
    };
  }

  // Print detailed cache report
  printReport() {
    if (!this.isEnabled) {
      console.log('🔍 Cache debugger is disabled. Call enable() to see reports.');
      return;
    }

    const stats = this.getStats();
    
    console.log('📊 Cache Performance Report');
    console.log('========================');
    console.log(`Cache Entries:`);
    console.log(`  Memory: ${stats.cache.memory}`);
    console.log(`  LocalStorage: ${stats.cache.localStorage}`);
    console.log(`  SessionStorage: ${stats.cache.sessionStorage}`);
    
    if (stats.memory) {
      console.log(`Memory Usage:`);
      console.log(`  Used: ${stats.memory.used}MB`);
      console.log(`  Total: ${stats.memory.total}MB`);
      console.log(`  Limit: ${stats.memory.limit}MB`);
    }
    
    console.log(`Log Entries: ${stats.logs}`);
    console.log(`Debugger: ${stats.enabled ? 'Enabled' : 'Disabled'}`);
    
    // Show recent events
    if (this.logs.length > 0) {
      console.log('\n📝 Recent Cache Events:');
      this.logs.slice(-10).forEach(log => {
        const emoji = this.getEventEmoji(log.event);
        console.log(`  ${emoji} ${log.timestamp} - ${log.event}`);
      });
    }
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.log('🧹 Cache logs cleared');
  }

  // Export logs for analysis
  exportLogs() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      logs: this.logs
    };
  }

  // Monitor cache performance over time
  startMonitoring(intervalMs = 5000) {
    if (!this.isEnabled) return;

    this.monitoringInterval = setInterval(() => {
      const stats = this.getStats();
      const hitRate = this.calculateHitRate();
      
      this.log('monitor', {
        hitRate: `${(hitRate * 100).toFixed(1)}%`,
        memoryUsage: stats.memory,
        cacheEntries: stats.cache
      });
    }, intervalMs);

    console.log(`🔍 Cache monitoring started (${intervalMs}ms interval)`);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🔍 Cache monitoring stopped');
    }
  }

  // Calculate cache hit rate from logs
  calculateHitRate() {
    const hits = this.logs.filter(log => log.event === 'hit').length;
    const misses = this.logs.filter(log => log.event === 'miss').length;
    const total = hits + misses;
    
    return total > 0 ? hits / total : 0;
  }

  // Performance testing utilities
  async testCachePerformance(iterations = 100) {
    if (!this.isEnabled) return;

    console.log(`🧪 Testing cache performance with ${iterations} iterations...`);
    
    const testKey = 'performance_test';
    const testData = { message: 'test', timestamp: Date.now() };
    
    // Test memory cache
    const memoryStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      aiChatService.cacheService.setMemory(testKey + i, testData);
      aiChatService.cacheService.getMemory(testKey + i);
    }
    const memoryTime = performance.now() - memoryStart;
    
    // Test localStorage
    const localStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      aiChatService.cacheService.setLocal(testKey + i, testData);
      aiChatService.cacheService.getLocal(testKey + i);
    }
    const localTime = performance.now() - localStart;
    
    // Test sessionStorage
    const sessionStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      aiChatService.cacheService.setSession(testKey + i, testData);
      aiChatService.cacheService.getSession(testKey + i);
    }
    const sessionTime = performance.now() - sessionStart;
    
    console.log('📊 Cache Performance Results:');
    console.log(`  Memory Cache: ${memoryTime.toFixed(2)}ms (${(iterations / memoryTime * 1000).toFixed(0)} ops/sec)`);
    console.log(`  LocalStorage: ${localTime.toFixed(2)}ms (${(iterations / localTime * 1000).toFixed(0)} ops/sec)`);
    console.log(`  SessionStorage: ${sessionTime.toFixed(2)}ms (${(iterations / sessionTime * 1000).toFixed(0)} ops/sec)`);
  }
}

// Create singleton instance
const cacheDebugger = new CacheDebugger();

// Auto-enable in development
if (import.meta.env.MODE === 'development') {
  cacheDebugger.enable();
}

export default cacheDebugger; 
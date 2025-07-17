import axios from 'axios';

// Create a simple event emitter for loading state
class LoadingEventEmitter {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const loadingEvents = new LoadingEventEmitter();

const base = import.meta.env.VITE_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: `${base}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track active requests
let activeRequests = 0;

const updateLoadingState = () => {
  if (activeRequests === 0) {
    loadingEvents.emit({ type: 'stop' });
  } else if (activeRequests === 1) {
    loadingEvents.emit({ type: 'start' });
  }
};

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Skip loading for certain requests (like background polling)
  if (!config.skipLoading) {
    activeRequests++;
    updateLoadingState();
  }
  
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoading) {
      activeRequests = Math.max(0, activeRequests - 1);
      updateLoadingState();
    }
    return response;
  },
  (error) => {
    if (!error.config?.skipLoading) {
      activeRequests = Math.max(0, activeRequests - 1);
      updateLoadingState();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

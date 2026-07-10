import axios from 'axios';

/**
 * API Configuration
 * Base URL for all API requests
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Handle 401 Unauthorized - clear token and redirect
      if (error.response.status === 401) {
        localStorage.removeItem('adminToken');
        // Only redirect if we're in the browser
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
      
      // Server responded with error status
      return Promise.reject({
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response - backend might not be running
      const errorMessage = error.code === 'ECONNREFUSED' 
        ? 'Cannot connect to backend server. Make sure the backend is running on http://localhost:5001'
        : 'Network error. Please check your connection and ensure the backend server is running on port 5001.';
      return Promise.reject({
        message: errorMessage,
        status: 0,
        code: error.code,
      });
    } else {
      // Error setting up request
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0,
      });
    }
  }
);

export default api;


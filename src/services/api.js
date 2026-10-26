import axios from 'axios';

/**
 * Base URL for API requests.
 * Uses VITE_API_URL if configured, otherwise falls back to relative '/api'.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Configured Axios instance for CampusPulse secure API communications.
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Injects Authorization Bearer token into outgoing HTTP requests if present in storage.
 */
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Storage access error handling in restricted environments
      console.warn('Unable to access token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Intercepts responses to handle authentication invalidation (HTTP 401) and format errors.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle expired or invalid session
      if (error.response.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
        } catch {}

        const publicPaths = ['/login', '/register', '/map', '/'];
        if (typeof window !== 'undefined' && !publicPaths.includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to programmatically update or clear the active Authorization token.
 * @param {string|null} token
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      localStorage.setItem('token', token);
    } catch {}
  } else {
    delete api.defaults.headers.common['Authorization'];
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
  }
};

export default api;

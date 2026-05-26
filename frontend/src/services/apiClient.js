import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for AI requests
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('ai_repair_user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed.token) {
          config.headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      } catch {
        // Corrupted storage — ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Attempt token refresh on 401 (once only)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const userStr = localStorage.getItem('ai_repair_user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          if (parsed.refresh) {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/api/auth/token/refresh/`,
              { refresh: parsed.refresh }
            );

            const newToken = refreshResponse.data.access;
            const newRefresh = refreshResponse.data.refresh || parsed.refresh;

            // Update stored tokens
            const updatedUser = { ...parsed, token: newToken, refresh: newRefresh };
            localStorage.setItem('ai_repair_user', JSON.stringify(updatedUser));

            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // Refresh failed — clear auth and redirect
          localStorage.removeItem('ai_repair_user');
          window.location.href = '/login';
        }
      }
    }

    // Standardize error format
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.response?.data?.message ||
      (typeof error.response?.data === 'object'
        ? Object.values(error.response?.data || {}).flat().join(' ')
        : null) ||
      'An unexpected error occurred. Please try again.';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default apiClient;

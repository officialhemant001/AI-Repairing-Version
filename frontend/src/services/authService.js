import apiClient from './apiClient';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login/', { email, password });
      if (response.data?.access) {
        // Decode name from JWT claims or use email
        let name = email.split('@')[0];
        try {
          const payload = JSON.parse(atob(response.data.access.split('.')[1]));
          if (payload.name) name = payload.name;
        } catch {
          // JWT decode failed — use email prefix
        }

        const user = {
          email,
          name,
          token: response.data.access,
          refresh: response.data.refresh,
        };
        localStorage.setItem('ai_repair_user', JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid credentials. Please try again.');
    } catch (error) {
      if (error.message && !error.status) throw error;
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        'Invalid credentials. Please try again.'
      );
    }
  },

  register: async (name, email, password) => {
    try {
      await apiClient.post('/api/auth/register/', { name, email, password });
      // Auto login after successful registration
      return await authService.login(email, password);
    } catch (error) {
      throw new Error(
        error.message ||
        'Registration failed. Please check your details.'
      );
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/auth/profile/');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile.');
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.patch('/api/auth/profile/', data);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile.');
    }
  },

  logout: () => {
    localStorage.removeItem('ai_repair_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('ai_repair_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

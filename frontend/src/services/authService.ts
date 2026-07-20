import apiClient from './apiClient';
import { User, AuthUser } from '../types/auth';

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    try {
      const response = await apiClient.post('/api/auth/login/', { email, password });
      if (response.data?.access) {
        let name = email.split('@')[0];
        try {
          const payload = JSON.parse(atob(response.data.access.split('.')[1]));
          if (payload.name) name = payload.name;
        } catch {
          // JWT decode failed — use email prefix
        }

        const user: AuthUser = {
          email,
          name,
          token: response.data.access,
          refresh: response.data.refresh,
        };
        localStorage.setItem('ai_repair_user', JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid credentials. Please try again.');
    } catch (error: any) {
      if (error.message && !error.status) throw error;
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        'Invalid credentials. Please try again.'
      );
    }
  },

  register: async (name: string, email: string, password: string): Promise<AuthUser> => {
    try {
      await apiClient.post('/api/auth/register/', { name, email, password });
      return await authService.login(email, password);
    } catch (error: any) {
      throw new Error(
        error.message ||
        'Registration failed. Please check your details.'
      );
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/api/auth/profile/');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch profile.');
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      // Support multipart form data for avatar uploads if data contains image
      const hasFile = data.avatar instanceof File;
      const headers = hasFile ? { 'Content-Type': 'multipart/form-data' } : {};
      
      let payload: any = data;
      if (hasFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value as any);
          }
        });
        payload = formData;
      }

      const response = await apiClient.patch('/api/auth/profile/', payload, { headers });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile.');
    }
  },

  forgotPassword: async (email: string): Promise<string> => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password/', { email });
      return response.data.message || 'Reset link sent successfully.';
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset link.');
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    try {
      const response = await apiClient.post('/api/auth/reset-password/', {
        token,
        new_password: newPassword,
      });
      return response.data.message || 'Password reset successful.';
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password.');
    }
  },

  deleteAccount: async (): Promise<string> => {
    try {
      const response = await apiClient.delete('/api/auth/delete-account/');
      return response.data.message || 'Account deleted successfully.';
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete account.');
    }
  },

  logout: () => {
    localStorage.removeItem('ai_repair_user');
  },

  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('ai_repair_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

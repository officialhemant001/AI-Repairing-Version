// import apiClient from './apiClient'; // Uncomment when backend is ready

export const authService = {
  login: async (email, password) => {
    // MOCK IMPLEMENTATION
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const mockUser = { 
        id: Date.now(), 
        name: email.split('@')[0], 
        email, 
        token: 'mock-jwt-token-123',
        scansCount: 0,
        history: []
      };
      localStorage.setItem('ai_repair_user', JSON.stringify(mockUser));
      return mockUser;
    }
    throw new Error('Invalid credentials. Please try again.');
  },

  register: async (name, email, password) => {
    // MOCK IMPLEMENTATION
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (name && email && password) {
      const mockUser = { 
        id: Date.now(), 
        name, 
        email, 
        token: 'mock-jwt-token-456',
        scansCount: 0,
        history: []
      };
      localStorage.setItem('ai_repair_user', JSON.stringify(mockUser));
      return mockUser;
    }
    throw new Error('Registration failed. Please check your details.');
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
  }
};

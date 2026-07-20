import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthUser, User } from '../types/auth';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resultData: any | null;
  setResultData: React.Dispatch<React.SetStateAction<any | null>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  resetState: () => void;
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  theme: string;
  toggleTheme: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // Theme state
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('ai_repair_theme') || 'dark';
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ai_repair_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Toast notifications
  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auth actions
  const login = async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      addToast('Welcome back!', 'success');
      return loggedInUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.register(name, email, password);
      setUser(newUser);
      addToast('Account created successfully!', 'success');
      return newUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    addToast('Logged out successfully.', 'info');
  };

  const resetState = () => {
    setLoading(false);
    setResultData(null);
    setError(null);
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        setLoading,
        resultData,
        setResultData,
        error,
        setError,
        resetState,
        user,
        setUser,
        login,
        register,
        logout,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AppContext = createContext();

/* eslint-disable react-refresh/only-export-components */
export const AppProvider = ({ children }) => {
  // UI states
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Auth state - lazy initialize
  const [user, setUser] = useState(() => authService.getCurrentUser());

  // Theme state
  const [theme, setTheme] = useState(() => {
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
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auth actions
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      addToast('Welcome back!', 'success');
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.register(name, email, password);
      setUser(newUser);
      addToast('Account created successfully!', 'success');
      return newUser;
    } catch (err) {
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

export const useAppContext = () => {
  return useContext(AppContext);
};

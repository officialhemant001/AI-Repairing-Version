import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { scanService } from '../services/scanService';

const AppContext = createContext();

/* eslint-disable react-refresh/only-export-components */
export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);
  
  // Auth state
  const [user, setUser] = useState(null);

  // Initialize user on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
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
  };

  const addScanToHistory = (scanData) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      scansCount: (user.scansCount || 0) + 1,
      history: [scanData, ...(user.history || [])]
    };
    setUser(updatedUser);
    localStorage.setItem('ai_repair_user', JSON.stringify(updatedUser));
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
        addScanToHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

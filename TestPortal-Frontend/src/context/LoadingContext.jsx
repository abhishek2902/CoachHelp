import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState(new Map());
  const [globalLoading, setGlobalLoading] = useState(false);

  const startLoading = useCallback((key = 'global') => {
    if (key === 'global') {
      setGlobalLoading(true);
    } else {
      setLoadingStates(prev => new Map(prev.set(key, true)));
    }
  }, []);

  const stopLoading = useCallback((key = 'global') => {
    if (key === 'global') {
      setGlobalLoading(false);
    } else {
      setLoadingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, []);

  const isLoading = useCallback((key = 'global') => {
    if (key === 'global') {
      return globalLoading;
    }
    return loadingStates.has(key);
  }, [globalLoading, loadingStates]);

  const clearAllLoading = useCallback(() => {
    setGlobalLoading(false);
    setLoadingStates(new Map());
  }, []);

  const value = {
    globalLoading,
    loadingStates,
    startLoading,
    stopLoading,
    isLoading,
    clearAllLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}; 
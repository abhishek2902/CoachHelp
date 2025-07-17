import { useState, useCallback } from 'react';
import { useLoading } from '../context/LoadingContext';

export const useApiLoading = (key = null) => {
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [localLoading, setLocalLoading] = useState(false);

  const withLoading = useCallback(async (asyncFunction, loadingKey = key) => {
    try {
      if (loadingKey) {
        startLoading(loadingKey);
      } else {
        setLocalLoading(true);
      }
      
      const result = await asyncFunction();
      return result;
    } finally {
      if (loadingKey) {
        stopLoading(loadingKey);
      } else {
        setLocalLoading(false);
      }
    }
  }, [startLoading, stopLoading, key]);

  const loading = key ? isLoading(key) : localLoading;

  return {
    loading,
    withLoading,
    startLoading: (loadingKey = key) => {
      if (loadingKey) {
        startLoading(loadingKey);
      } else {
        setLocalLoading(true);
      }
    },
    stopLoading: (loadingKey = key) => {
      if (loadingKey) {
        stopLoading(loadingKey);
      } else {
        setLocalLoading(false);
      }
    }
  };
}; 
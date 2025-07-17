import React, { useEffect } from 'react';
import { LoadingProvider as BaseLoadingProvider, useLoading } from '../context/LoadingContext';
import { loadingEvents } from '../api/axiosInstance';
import GlobalLoader from './GlobalLoader';

const LoadingProviderWrapper = ({ children }) => {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const unsubscribe = loadingEvents.subscribe((event) => {
      if (event.type === 'start') {
        startLoading('global');
      } else if (event.type === 'stop') {
        stopLoading('global');
      }
    });

    return unsubscribe;
  }, [startLoading, stopLoading]);

  return (
    <>
      {children}
      <GlobalLoader />
    </>
  );
};

export const LoadingProvider = ({ children }) => {
  return (
    <BaseLoadingProvider>
      <LoadingProviderWrapper>
        {children}
      </LoadingProviderWrapper>
    </BaseLoadingProvider>
  );
}; 
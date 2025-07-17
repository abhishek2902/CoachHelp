import React from 'react';
import { useLoading } from '../context/LoadingContext';
import LoaderCircle from './LoaderCircle';

const GlobalLoader = () => {
  const { globalLoading } = useLoading();

  if (!globalLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-xl">
        <LoaderCircle className="w-12 h-12 text-blue-600" />
        <div className="text-lg font-semibold text-gray-700">Loading...</div>
        <div className="text-sm text-gray-500">Please wait while we process your request</div>
      </div>
    </div>
  );
};

export default GlobalLoader; 
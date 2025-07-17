import React from 'react';
import LoaderCircle from './LoaderCircle';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = '', 
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const spinner = (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <LoaderCircle className={`${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && (
        <div className="text-sm font-medium text-gray-600">{text}</div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 
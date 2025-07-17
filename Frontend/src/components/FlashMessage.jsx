import React, { useEffect } from 'react';
import { CircleCheckBig, Info, TriangleAlert, X } from 'lucide-react';

const FlashMessage = ({ message, type = 'info', onClose, time = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, time);
    return () => clearTimeout(timer);
  }, [onClose, time]);

  const bgColor = {
    info: 'bg-blue-700',
    success: 'bg-green-700',
    error: 'bg-red-700',
  }[type];

  const Icon = {
    info: Info,
    success: CircleCheckBig,
    error: TriangleAlert,
  }[type];

  return (
    <div className={`flex items-center fixed top-1/2 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white ${bgColor} z-50 min-w-[250px] justify-between`}>
      <div className="flex items-center">
        <Icon className="w-4 mr-2" />
        <span className="text-sm">{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 text-white hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FlashMessage;

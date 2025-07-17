import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 ">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center border border-gray-200">
        <div className="flex items-center justify-center mb-6 text-red-500">
          <ShieldOff className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">403 - Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page or resource.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

import React from "react";

const ImageModal = ({ src, alt, onClose }) => {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded shadow-lg p-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-700 hover:text-red-600 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <img src={src} alt={alt} className="max-w-[80vw] max-h-[80vh] rounded" />
      </div>
    </div>
  );
};

export default ImageModal; 
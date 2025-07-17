import React, { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

const ResizableDivider = ({ 
  onResize, 
  minWidth = 200, 
  maxWidth = 800, 
  position = 'right' // 'left' or 'right'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const container = dividerRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      let newWidth;

      if (position === 'right') {
        newWidth = e.clientX - containerRect.left;
      } else {
        newWidth = containerRect.right - e.clientX;
      }

      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, onResize, minWidth, maxWidth, position]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      ref={dividerRef}
      className={`relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-col-resize transition-colors ${
        isDragging ? 'bg-blue-200' : ''
      }`}
      style={{ width: '4px' }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col items-center">
        <GripVertical size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

export default ResizableDivider; 
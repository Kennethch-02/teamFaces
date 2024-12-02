import React from 'react';

const LoadingSpinner = ({ 
  size = 'md',
  color = 'primary',
  fullScreen = true
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4'
  };

  const colorClasses = {
    primary: 'border-t-blue-600 border-b-blue-600',
    secondary: 'border-t-gray-600 border-b-gray-600',
    success: 'border-t-green-600 border-b-green-600',
    warning: 'border-t-yellow-600 border-b-yellow-600',
    error: 'border-t-red-600 border-b-red-600'
  };

  const containerClasses = fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm' : 'w-full h-full';

  return (
    <div className={`${containerClasses} flex items-center justify-center z-50`}>
      <div className="flex flex-col items-center gap-4">
        <div 
          className={`
            animate-spin 
            rounded-full 
            ${sizeClasses[size]} 
            ${colorClasses[color]}
            border-transparent
          `}
          role="status"
          aria-label="Loading"
        />
        <span className="text-gray-500 text-sm">Cargando...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
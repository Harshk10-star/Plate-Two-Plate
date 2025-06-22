import React from 'react';

// A reusable card component with sage-themed styling
export const Card = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-sage-light border border-sage-primary',
    secondary: 'bg-white border-l-4 border-sage-primary',
  };

  return (
    <div className={`rounded-xl shadow-md p-4 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

// A styled button with sage theme colors
export const Button = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  type = 'button'
}) => {
  const variantStyles = {
    primary: 'bg-sage-primary hover:bg-sage-dark text-white',
    secondary: 'bg-sage-secondary hover:bg-sage-secondary-dark text-white',
    outline: 'border border-sage-primary text-sage-primary hover:bg-sage-light',
    text: 'text-sage-primary hover:text-sage-dark hover:underline',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-colors duration-200 
                 ${variantStyles[variant]} ${sizeStyles[size]} 
                 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                 ${className}`}
    >
      {children}
    </button>
  );
};

// A simple divider component
export const Divider = ({ className = '', light = false }) => (
  <hr className={`border-t ${light ? 'border-gray-100' : 'border-gray-200'} my-4 ${className}`} />
);

// A badge component for status indicators
export const Badge = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium 
                     ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
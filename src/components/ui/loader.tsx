
import React from "react";

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Loader = ({ size = 'medium', className = '' }: LoaderProps) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-primary border-t-transparent`}></div>
    </div>
  );
};

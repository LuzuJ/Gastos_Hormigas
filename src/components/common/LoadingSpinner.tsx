import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'currentColor',
  message
}) => {
  const spinnerSizeClass = `spinner-${size}`;
  
  return (
    <div className="loading-spinner-container">
      <div 
        className={`loading-spinner ${spinnerSizeClass}`}
        style={{ borderTopColor: color }}
      ></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};
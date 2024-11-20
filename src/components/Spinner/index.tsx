import * as React from 'react';
import './styles.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  fullscreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = 'currentColor',
  className = '',
  fullscreen = false,
}) => {
  const spinner = (
    <div 
      className={`
        spinner 
        spinner-${size} 
        ${color !== 'currentColor' ? 'spinner-custom-color' : ''} 
        ${className}
      `}
      data-color={color}
    >
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="5"
          className="spinner-circle"
        />
      </svg>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="spinner-overlay">
        {spinner}
      </div>
    );
  }

  return spinner;
};

Spinner.displayName = 'Spinner'; 
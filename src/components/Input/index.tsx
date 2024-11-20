import * as React from 'react';
import './styles.css';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      size = 'medium',
      fullWidth = false,
      startAdornment,
      endAdornment,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && (
          <label className="input-label">
            {label}
          </label>
        )}
        <div className={`input-container input-${size} ${error ? 'has-error' : ''}`}>
          {startAdornment && (
            <div className="input-adornment start">{startAdornment}</div>
          )}
          <input
            ref={ref}
            className="input"
            disabled={disabled}
            {...props}
          />
          {endAdornment && (
            <div className="input-adornment end">{endAdornment}</div>
          )}
        </div>
        {error && (
          <span className="input-error">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 
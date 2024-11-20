import * as React from 'react';
import './styles.css';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: Array<{ value: string; label: string }>;
  label?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`select-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
      {label && <label className="select-label">{label}</label>}
      <select 
        className={`select select-${size} ${error ? 'has-error' : ''}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error">{error}</span>}
    </div>
  );
}; 
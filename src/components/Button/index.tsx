import * as React from 'react';
import './styles.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      fullWidth = false,
      className = '',
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !loading && onClick) {
          onClick(event);
        }
      },
      [disabled, loading, onClick]
    );

    return (
      <button
        ref={ref}
        type={type}
        className={`
          btn 
          btn-${variant} 
          btn-${size} 
          ${loading ? 'loading' : ''} 
          ${fullWidth ? 'full-width' : ''}
          ${className}
        `}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && <span className="spinner" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button'; 
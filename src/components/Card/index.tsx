import * as React from 'react';
import './styles.css';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  hoverable = false,
  bordered = true,
  loading = false,
}) => {
  return (
    <div 
      className={`
        card 
        ${hoverable ? 'hoverable' : ''} 
        ${bordered ? 'bordered' : ''} 
        ${loading ? 'loading' : ''} 
        ${className}
      `}
    >
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-content">
        {loading ? (
          <div className="card-skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

Card.displayName = 'Card'; 
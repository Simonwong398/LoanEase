import * as React from 'react';
import './styles.css';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fixed?: boolean;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  fixed = false,
  className = ''
}) => {
  return (
    <div 
      className={`
        container 
        ${maxWidth ? `max-width-${maxWidth}` : ''} 
        ${fixed ? 'fixed' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
}; 
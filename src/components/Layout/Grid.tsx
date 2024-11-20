import * as React from 'react';
import './Grid.css';

interface GridProps {
  children: React.ReactNode;
  spacing?: 1 | 2 | 3 | 4;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  spacing = 2,
  className = ''
}) => {
  return (
    <div className={`grid grid-spacing-${spacing} ${className}`}>
      {children}
    </div>
  );
}; 
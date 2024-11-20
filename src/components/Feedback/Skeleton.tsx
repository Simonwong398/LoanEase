import * as React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = ''
}) => {
  return (
    <div 
      className={`
        skeleton 
        skeleton-${variant} 
        ${animation !== 'none' ? `animation-${animation}` : ''} 
        ${className}
      `}
      data-width={width}
      data-height={height}
    />
  );
}; 
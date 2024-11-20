import * as React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'var(--color-primary)',
  height = 4,
  showLabel = false,
  animated = true
}) => {
  const progressValue = Math.min(100, Math.max(0, progress));
  
  return (
    <div 
      className={`
        progress-container 
        progress-height-${height}
        ${color !== 'var(--color-primary)' ? 'progress-custom-color' : ''}
      `}
      data-color={color}
      data-progress={progressValue}
    >
      <div className={`progress-bar ${animated ? 'animated' : ''}`} />
      {showLabel && (
        <span className="progress-label">{Math.round(progressValue)}%</span>
      )}
    </div>
  );
}; 
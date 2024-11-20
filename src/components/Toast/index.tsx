import * as React from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  return (
    <div className={`toast toast-${type}`} data-duration={duration}>
      <div className="toast-content">
        <span className="toast-icon" />
        <span className="toast-message">{message}</span>
      </div>
      <div className="toast-progress" />
    </div>
  );
}; 
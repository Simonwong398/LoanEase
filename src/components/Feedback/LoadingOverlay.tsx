import * as React from 'react';
import { Spinner } from '../Spinner';
import './styles.css';

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  message = 'Loading...',
  blur = true
}) => {
  if (!loading) return null;

  return (
    <div className={`loading-overlay ${blur ? 'blur' : ''}`}>
      <div className="loading-content">
        <Spinner size="large" />
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
}; 
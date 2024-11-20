import * as React from 'react';
import './styles.css';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  loading = false,
  className = '',
  ...props
}) => {
  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!loading && onSubmit) {
        onSubmit(event);
      }
    },
    [loading, onSubmit]
  );

  return (
    <form
      className={`form ${loading ? 'loading' : ''} ${className}`}
      onSubmit={handleSubmit}
      {...props}
    >
      {loading && <div className="form-overlay" />}
      {children}
    </form>
  );
};

Form.displayName = 'Form'; 
import React, { useEffect, useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { SpyInstance } from 'jest-mock';
import { ErrorBoundary } from '../index';
import '@testing-library/jest-dom';

// 导入 jest-dom 的类型
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// 扩展 expect 的类型
declare module '@jest/expect' {
  interface Matchers<R extends void | Promise<void>, T = unknown>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
}

// 测试组件
const ThrowError: React.FC<{ message?: string }> = ({ message = 'Test error' }) => {
  throw new Error(message);
};

const AsyncThrowError: React.FC = () => {
  useEffect(() => {
    throw new Error('Async error');
  }, []);
  return <div>Loading...</div>;
};

const EventThrowError: React.FC = () => {
  const handleClick = () => {
    throw new Error('Event error');
  };
  return <button onClick={handleClick}>Trigger Error</button>;
};

const StateThrowError: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  useEffect(() => {
    if (shouldThrow) {
      throw new Error('State error');
    }
  }, [shouldThrow]);

  return <button onClick={() => setShouldThrow(true)}>Trigger State Error</button>;
};

describe('ErrorBoundary', () => {
  let consoleError: SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  describe('Basic Error Handling', () => {
    it('should catch render errors', () => {
      const handleError = jest.fn();
      const fallback = <div>Error occurred</div>;

      render(
        <ErrorBoundary fallback={fallback} onError={handleError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(handleError).toHaveBeenCalled();
    });

    it('should pass error details to fallback component', () => {
      const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
        <div>Error: {error.message}</div>
      );

      render(
        <ErrorBoundary fallback={<ErrorFallback error={new Error('')} />}>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error: Custom error message')).toBeInTheDocument();
    });
  });

  describe('Async Error Handling', () => {
    it('should catch async errors', async () => {
      const handleError = jest.fn();

      render(
        <ErrorBoundary fallback={<div>Async error occurred</div>} onError={handleError}>
          <AsyncThrowError />
        </ErrorBoundary>
      );

      // Wait for async error
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText('Async error occurred')).toBeInTheDocument();
      expect(handleError).toHaveBeenCalled();
    });

    it('should handle event handler errors', () => {
      const handleError = jest.fn();

      render(
        <ErrorBoundary fallback={<div>Event error occurred</div>} onError={handleError}>
          <EventThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Trigger Error'));

      expect(screen.getByText('Event error occurred')).toBeInTheDocument();
      expect(handleError).toHaveBeenCalled();
    });

    it('should handle state update errors', async () => {
      const handleError = jest.fn();

      render(
        <ErrorBoundary fallback={<div>State error occurred</div>} onError={handleError}>
          <StateThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Trigger State Error'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText('State error occurred')).toBeInTheDocument();
      expect(handleError).toHaveBeenCalled();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should contain errors to nearest boundary', () => {
      render(
        <ErrorBoundary fallback={<div>Outer error</div>}>
          <div>
            <ErrorBoundary fallback={<div>Inner error</div>}>
              <ThrowError />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Inner error')).toBeInTheDocument();
      expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
    });

    it('should handle multiple errors in different boundaries', () => {
      render(
        <ErrorBoundary fallback={<div>Outer error</div>}>
          <div>
            <ErrorBoundary fallback={<div>Error 1</div>}>
              <ThrowError message="Error 1" />
            </ErrorBoundary>
            <ErrorBoundary fallback={<div>Error 2</div>}>
              <ThrowError message="Error 2" />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
    });
  });

  describe('Recovery and Reset', () => {
    it('should reset error boundary when children change', () => {
      const { rerender } = render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();

      rerender(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <div>New content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('New content')).toBeInTheDocument();
    });

    it('should support retry functionality', () => {
      const RetryFallback: React.FC<{ reset: () => void }> = ({ reset }) => (
        <button onClick={reset}>Retry</button>
      );

      const { rerender } = render(
        <ErrorBoundary fallback={<RetryFallback reset={() => {}} />}>
          <ThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Retry'));

      rerender(
        <ErrorBoundary fallback={<RetryFallback reset={() => {}} />}>
          <div>Recovered content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Recovered content')).toBeInTheDocument();
    });
  });

  describe('Error Reporting', () => {
    it('should provide error details to error handler', () => {
      const handleError = jest.fn();
      const errorMessage = 'Detailed error message';

      render(
        <ErrorBoundary fallback={<div>Error occurred</div>} onError={handleError}>
          <ThrowError message={errorMessage} />
        </ErrorBoundary>
      );

      expect(handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: errorMessage
        }),
        expect.any(Object)
      );
    });

    it('should include component stack in error info', () => {
      const handleError = jest.fn();

      render(
        <ErrorBoundary fallback={<div>Error occurred</div>} onError={handleError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });
}); 
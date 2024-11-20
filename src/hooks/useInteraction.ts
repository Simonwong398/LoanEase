import { useState, useCallback } from 'react';

interface UseInteractionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const useInteraction = (options: UseInteractionOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleInteraction = useCallback(async (action: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(null);
      options.onStart?.();
      
      await action();
      
      options.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
      options.onEnd?.();
    }
  }, [options]);

  return {
    loading,
    error,
    handleInteraction
  };
}; 
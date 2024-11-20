import { useState, useCallback } from 'react';

interface LoadingState {
  loading: boolean;
  progress: number;
  error: Error | null;
}

export const useLoadingState = (initialState: Partial<LoadingState> = {}) => {
  const [state, setState] = useState<LoadingState>({
    loading: false,
    progress: 0,
    error: null,
    ...initialState
  });

  const startLoading = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const finishLoading = useCallback(() => {
    setState(prev => ({ ...prev, loading: false, progress: 100 }));
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, progress: 0, error: null });
  }, []);

  return {
    ...state,
    startLoading,
    setProgress,
    setError,
    finishLoading,
    reset
  };
}; 
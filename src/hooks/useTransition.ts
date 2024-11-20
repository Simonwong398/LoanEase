import { useState, useCallback } from 'react';

interface UseTransitionProps {
  timeout?: number;
  onEnter?: () => void;
  onExit?: () => void;
}

export const useTransition = ({
  timeout = 300,
  onEnter,
  onExit
}: UseTransitionProps = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const enter = useCallback(() => {
    if (isExiting) return;
    
    setIsVisible(true);
    setIsEntering(true);
    onEnter?.();

    setTimeout(() => {
      setIsEntering(false);
    }, timeout);
  }, [isExiting, timeout, onEnter]);

  const exit = useCallback(() => {
    if (isEntering) return;

    setIsExiting(true);
    onExit?.();

    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
    }, timeout);
  }, [isEntering, timeout, onExit]);

  return {
    isVisible,
    isEntering,
    isExiting,
    enter,
    exit
  };
}; 
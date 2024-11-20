import { useEffect, useState } from 'react';

type AnimationName = 'fadeIn' | 'fadeOut' | 'slideUp' | 'slideDown' | 'zoomIn' | 'zoomOut';

interface UseAnimationProps {
  name: AnimationName;
  duration?: number;
  delay?: number;
  timingFunction?: string;
}

export const useAnimation = ({
  name,
  duration = 300,
  delay = 0,
  timingFunction = 'ease'
}: UseAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
        setIsAnimating(false);
      }, duration + delay);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, duration, delay]);

  const style = {
    animation: isAnimating ? `${name} ${duration}ms ${timingFunction} ${delay}ms` : '',
    opacity: !isAnimating && !hasAnimated ? 0 : 1
  };

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setHasAnimated(false);
  };

  return { style, startAnimation, resetAnimation, isAnimating, hasAnimated };
}; 
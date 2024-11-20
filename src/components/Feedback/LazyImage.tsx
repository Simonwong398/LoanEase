import * as React from 'react';
import './styles.css';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  threshold?: number;
  effect?: 'blur' | 'fade' | 'none';
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallback = '',
  threshold = 0.1,
  effect = 'blur',
  alt = '',
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const currentImg = imgRef.current;
    if (!currentImg) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && currentImg) {
          currentImg.setAttribute('src', src);
          observer.unobserve(currentImg);
        }
      },
      { threshold }
    );

    observer.observe(currentImg);

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [src, threshold]);

  return (
    <img
      ref={imgRef}
      src={fallback}
      alt={alt}
      className={`
        lazy-image 
        ${effect !== 'none' ? `effect-${effect}` : ''} 
        ${isLoaded ? 'loaded' : ''} 
        ${className}
      `}
      onLoad={() => setIsLoaded(true)}
      onError={() => setError(true)}
      {...props}
    />
  );
}; 
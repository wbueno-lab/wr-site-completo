import { useState } from 'react';

interface DirectImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const DirectImage = ({
  src,
  alt,
  className = ''
}: DirectImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('DirectImage error:', src, e);
    setHasError(true);
    setIsLoaded(true);
  };

  const imageSrc = hasError ? '/placeholder.svg' : (src || '/placeholder.svg');


  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-muted-foreground/20 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default DirectImage;

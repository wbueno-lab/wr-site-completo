import { useState } from 'react';

interface SimpleSupabaseImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const SimpleSupabaseImage = ({ src, alt, className = '' }: SimpleSupabaseImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Se há erro ou não há src válido, mostrar placeholder
  const imageSrc = hasError || !src ? '/placeholder.svg' : src;

  return (
    <div className="relative">
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default SimpleSupabaseImage;

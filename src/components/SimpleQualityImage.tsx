import { useState } from 'react';

interface SimpleQualityImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const SimpleQualityImage = ({
  src,
  alt,
  className = ''
}: SimpleQualityImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png') {
      target.src = '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png';
    } else if (target.src !== '/placeholder.svg') {
      target.src = '/placeholder.svg';
    }
    setIsLoaded(true);
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={src || '/lovable-uploads/2aadae8f-c01d-4d0c-acc2-ad56fe5ef243.png'}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          imageRendering: '-webkit-optimize-contrast'
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default SimpleQualityImage;

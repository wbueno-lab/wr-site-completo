import { useState } from 'react';

interface NativeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const NativeImage = ({ src, alt, className = '' }: NativeImageProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.error('NativeImage error:', src);
    setHasError(true);
  };

  const imageSrc = hasError ? '/placeholder.svg' : (src || '/placeholder.svg');

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default NativeImage;


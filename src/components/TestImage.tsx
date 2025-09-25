import { useState } from 'react';

interface TestImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const TestImage = ({ src, alt, className = '' }: TestImageProps) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleLoad = () => {
    setStatus('loaded');
  };

  const handleError = () => {
    setStatus('error');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-0 left-0 bg-black text-white text-xs p-1 z-10">
        {status === 'loading' && '🔄 Loading...'}
        {status === 'loaded' && '✅ Loaded'}
        {status === 'error' && '❌ Error'}
      </div>
      
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          border: status === 'error' ? '2px solid red' : 'none'
        }}
      />
      
      {status === 'error' && (
        <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-red-700 text-sm">Erro ao carregar</p>
            <p className="text-red-600 text-xs break-all">{src}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestImage;

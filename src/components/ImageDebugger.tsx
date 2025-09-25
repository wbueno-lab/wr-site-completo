import { useState, useEffect } from 'react';
import { ForceQualityImage } from './ForceQualityImage';

interface ImageDebuggerProps {
  product: {
    id: string;
    name: string;
    image_url?: string;
    image_thumbnail?: string;
    image_medium?: string;
    image_large?: string;
  };
}

export const ImageDebugger = ({ product }: ImageDebuggerProps) => {
  const [imageInfo, setImageInfo] = useState<any>(null);

  useEffect(() => {
    const checkImage = async (url: string) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return {
          url,
          status: response.status,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
          lastModified: response.headers.get('last-modified')
        };
      } catch (error) {
        return {
          url,
          status: 'error',
          error: error.message
        };
      }
    };

    const checkAllImages = async () => {
      const images = [
        product.image_url,
        product.image_thumbnail,
        product.image_medium,
        product.image_large
      ].filter(Boolean);

      const results = await Promise.all(images.map(checkImage));
      setImageInfo(results);
    };

    checkAllImages();
  }, [product]);

  return (
    <div className="border-2 border-red-500 p-4 m-4 bg-gray-100">
      <h3 className="font-bold text-red-600 mb-2">DEBUG: {product.name}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {imageInfo?.map((info, index) => (
          <div key={index} className="border p-2">
            <h4 className="font-semibold">Imagem {index + 1}</h4>
            <p className="text-xs break-all">{info.url}</p>
            <p>Status: {info.status}</p>
            <p>Content-Type: {info.contentType}</p>
            <p>Size: {info.contentLength ? `${Math.round(parseInt(info.contentLength) / 1024)}KB` : 'Unknown'}</p>
            {info.error && <p className="text-red-500">Error: {info.error}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">image_url (Original)</h4>
          <div className="w-32 h-32 border">
            <ForceQualityImage
              src={product.image_url || '/placeholder.svg'}
              alt="Original"
              className="w-full h-full"
            />
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">image_large</h4>
          <div className="w-32 h-32 border">
            <ForceQualityImage
              src={product.image_large || '/placeholder.svg'}
              alt="Large"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDebugger;


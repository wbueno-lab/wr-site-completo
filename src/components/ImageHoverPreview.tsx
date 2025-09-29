import { useState, useRef, useEffect } from "react";
import { MaxQualityImage } from "./MaxQualityImage";

interface ImageHoverPreviewProps {
  src: string;
  alt: string;
  className?: string;
  previewSize?: number;
}

const ImageHoverPreview = ({ 
  src, 
  alt, 
  className = "", 
  previewSize = 300 
}: ImageHoverPreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    // Calcular posição da prévia baseada na posição do mouse
    const previewX = e.clientX + 10;
    const previewY = e.clientY - previewSize / 2;
    
    // Ajustar para não sair da tela
    const adjustedX = previewX + previewSize > window.innerWidth 
      ? e.clientX - previewSize - 10 
      : previewX;
    const adjustedY = previewY < 0 
      ? 10 
      : previewY + previewSize > window.innerHeight 
        ? window.innerHeight - previewSize - 10 
        : previewY;
    
    setPreviewPosition({ x: adjustedX, y: adjustedY });
  };

  const handleMouseEnter = () => {
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MaxQualityImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      
      {/* Preview Tooltip */}
      {showPreview && (
        <div
          className="fixed z-50 pointer-events-none border-2 border-white rounded-lg shadow-2xl overflow-hidden"
          style={{
            left: previewPosition.x,
            top: previewPosition.y,
            width: previewSize,
            height: previewSize,
          }}
        >
          <MaxQualityImage
            src={src}
            alt={`Preview - ${alt}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ImageHoverPreview;

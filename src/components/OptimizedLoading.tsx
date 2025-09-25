import React from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({ 
  size = 'md', 
  text = 'Carregando...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

export default OptimizedLoading;


import { useEffect, useState } from "react";

const LoadingScreen = ({ onLoadComplete }: { onLoadComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onLoadComplete, 500);
          return 100;
        }
        return prev + 1.5;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-secondary via-primary/90 to-secondary overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent-neon/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary/20 rounded-full blur-2xl animate-pulse-glow animation-delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-12">
        {/* Premium Logo */}
        <div className="text-center animate-fade-in">
          <div className="relative">
            <h1 className="text-7xl md:text-9xl font-black text-gradient-hero mb-4 tracking-[0.1em] drop-shadow-2xl">
              WR
            </h1>
            {/* Glow Effect Behind Logo */}
            <div className="absolute inset-0 text-7xl md:text-9xl font-black text-accent-neon/20 blur-xl tracking-[0.1em] -z-10">
              WR
            </div>
          </div>
          <div className="relative">
            <p className="text-2xl md:text-3xl text-foreground/90 font-light tracking-[0.4em] mb-2">
              CAPACETES
            </p>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-accent-neon to-transparent opacity-60" />
          </div>
        </div>

        {/* Minimalist Loading Spinner */}
        <div className="relative animate-fade-in animation-delay-500">
          {/* Simple Rotating Ring */}
          <div className="w-16 h-16 rounded-full border border-primary/20 relative">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-neon animate-spin" 
                 style={{ animationDuration: '1.5s' }} />
          </div>

          {/* Progress Indicator */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-accent-neon/60 font-mono">
            {progress.toFixed(0)}%
          </div>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="w-64 animate-fade-in animation-delay-1000">
          <div className="h-px bg-primary/30 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-neon/80 to-accent-neon transition-all duration-500 ease-out shadow-neon"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cinematic Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-secondary/40 pointer-events-none" />
    </div>
  );
};

export default LoadingScreen;
import { ArrowRight, Shield, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import lojafundo from "@/assets/lojafundo.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0">
        <img 
          src={lojafundo} 
          alt="Fundo da Loja" 
          className="w-full h-full object-cover"
        />
        {/* Enhanced dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80" />
        {/* Subtle green accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-900/5 to-green-900/10" />
      </div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          {/* Main Content - Centered */}
          <div className="flex-1 space-y-6 lg:space-y-8 max-w-4xl text-center">
            <div className="space-y-6">
              {/* Main Headline with Enhanced Typography */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
                <span className="block text-white drop-shadow-2xl">
                  <span className="text-gradient-hero">Proteção</span>{" "}
                  <span className="text-white">Premium</span>
                </span>
                <span className="block text-accent-neon text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold animate-pulse-glow drop-shadow-2xl">
                  Para Motociclistas
                </span>
              </h1>
              
              {/* Subtitle with Better Styling */}
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 max-w-2xl font-light leading-relaxed drop-shadow-lg mx-auto">
                Descubra a linha mais completa de capacetes com tecnologia de ponta e design exclusivo.
              </p>
            </div>

            {/* Enhanced Features Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-6 lg:py-8">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-white group">
                <div className="p-2 sm:p-3 rounded-full bg-accent-neon/20 backdrop-blur-sm border border-accent-neon/30 group-hover:bg-accent-neon/30 transition-all duration-300">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent-neon" />
                </div>
                <span className="font-bold text-base sm:text-lg">100% Seguro</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-white group">
                <div className="p-2 sm:p-3 rounded-full bg-accent-neon/20 backdrop-blur-sm border border-accent-neon/30 group-hover:bg-accent-neon/30 transition-all duration-300">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-accent-neon" />
                </div>
                <span className="font-bold text-base sm:text-lg">5 Estrelas</span>
              </div>
              
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-white group">
                <div className="p-2 sm:p-3 rounded-full bg-accent-neon/20 backdrop-blur-sm border border-accent-neon/30 group-hover:bg-accent-neon/30 transition-all duration-300">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-accent-neon" />
                </div>
                <span className="font-bold text-base sm:text-lg">Entrega Rápida</span>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link to="/catalogo">
                <Button 
                  size="xl" 
                  className="group bg-transparent border-2 border-accent-neon text-white hover:bg-accent-neon hover:text-black font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-neon backdrop-blur-sm w-full sm:w-auto"
                >
                  Ver Catálogo
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
              
              <Link to="/promocoes">
                <Button 
                  size="xl" 
                  className="group bg-accent-neon text-black hover:bg-accent-neon/90 font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-neon border-2 border-accent-neon w-full sm:w-auto"
                >
                  Ofertas Especiais
                </Button>
              </Link>
            </div>

            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 sm:pt-12 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-accent-neon drop-shadow-lg">500+</div>
                <div className="text-xs sm:text-sm text-white/80 font-medium uppercase tracking-wider">Modelos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-accent-neon drop-shadow-lg">10K+</div>
                <div className="text-xs sm:text-sm text-white/80 font-medium uppercase tracking-wider">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-accent-neon drop-shadow-lg">99%</div>
                <div className="text-xs sm:text-sm text-white/80 font-medium uppercase tracking-wider">Aprovação</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Floating Elements for Visual Interest */}
      <div className="absolute top-20 right-20 w-2 h-2 bg-accent-neon rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-40 right-40 w-1 h-1 bg-accent-neon rounded-full animate-pulse opacity-40 animation-delay-500"></div>
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-accent-neon rounded-full animate-pulse opacity-50 animation-delay-1000"></div>
    </section>
  );
};

export default HeroSection;
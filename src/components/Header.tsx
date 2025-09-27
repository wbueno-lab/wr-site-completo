import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X, LogOut, UserCircle, Package, Settings, Shield, Heart, Wifi, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import wrLogo from "@/assets/wr-logo-modern.png";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Link, useNavigate } from "react-router-dom";
import CartDrawer from "./CartDrawer";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile, signOut } = useAuth();
  const { getCartCount } = useCart();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background shadow-sm backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img src={wrLogo} alt="WR Capacetes" className="h-12 w-auto" />
          <h1 className="text-2xl font-bold text-gradient-hero">WR CAPACETES</h1>
        </div>

        {/* Navigation */}
        <nav className="mx-8 hidden md:flex items-center space-x-6 flex-1">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-accent-neon">
            Home
          </Link>
          <Link to="/catalogo" className="text-sm font-medium transition-colors hover:text-accent-neon">
            Capacetes
          </Link>
          
          {/* Vestuário Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-accent-neon p-0 h-auto">
                <span className="flex items-center gap-1">
                  Vestuário
                  <ChevronDown className="h-3 w-3" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-80 p-4 bg-background border border-border shadow-lg rounded-lg backdrop-blur-sm"
              sideOffset={4}
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Coluna 1 */}
                <div className="space-y-1">
                  <Link 
                    to="/vestuario?category=luvas" 
                    className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium"
                  >
                    Luvas
                  </Link>
                  <Link 
                    to="/vestuario?category=calças" 
                    className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium"
                  >
                    Calças
                  </Link>
                  <Link 
                    to="/vestuario?category=macacão" 
                    className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium"
                  >
                    Macacão
                  </Link>
                  <Link 
                    to="/vestuario?category=botas" 
                    className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium"
                  >
                    Botas
                  </Link>
                </div>
                
                {/* Coluna 2 */}
                <div className="space-y-1">
                  <Link 
                    to="/vestuario?category=balaclava" 
                    className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium"
                  >
                    Balaclava
                  </Link>
                  <Link 
                    to="/vestuario?category=segunda-pele" 
                    className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium"
                  >
                    Segunda Pele
                  </Link>
                  <Link 
                    to="/vestuario?category=capa-de-chuva" 
                    className="block px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium"
                  >
                    Capa de Chuva
                  </Link>
                </div>
              </div>
              
              {/* Separador e link para todos os produtos */}
              <div className="border-t border-border/50 mt-4 pt-4">
                <Link 
                  to="/vestuario" 
                  className="block px-3 py-2 text-sm font-semibold text-center text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors bg-muted/30"
                >
                  Ver Todos os Produtos de Vestuário
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/jaquetas" className="text-sm font-medium transition-colors hover:text-accent-neon">
            Jaquetas
          </Link>
          <Link to="/promocoes" className="text-sm font-medium transition-colors hover:text-accent-neon">
            Promoções
          </Link>
          <Link to="/favoritos" className="text-sm font-medium transition-colors hover:text-accent-neon">
            Favoritos
          </Link>
          <Link to="/contato" className="text-sm font-medium transition-colors hover:text-accent-neon">
            Contato
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* User & Cart */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-10 w-64 bg-background/50 border-muted focus:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-accent/10 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-neon flex items-center justify-center text-muted-foreground font-semibold text-sm">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-72 p-0 overflow-hidden bg-background border border-border shadow-lg rounded-lg backdrop-blur-sm"
                  sideOffset={4}
                >
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-primary to-accent-neon p-4 text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-background/20 flex items-center justify-center text-muted-foreground font-bold text-lg">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {profile?.full_name || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground/80 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2 bg-background">
                    <DropdownMenuItem className="px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <UserCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Meu Perfil</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Link to="/pedidos" className="flex items-center w-full">
                        <Package className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Meus Pedidos</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {profile?.is_admin && (
                      <DropdownMenuItem asChild className="px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors">
                        <Link to="/admin" className="flex items-center w-full">
                          <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Painel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                  </div>
                  
                  {/* Separator */}
                  <div className="border-t border-border/50 bg-background"></div>
                  
                  {/* Logout */}
                  <div className="py-2 bg-background">
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="px-4 py-3 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium">Sair</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Favorites */}
            <Link to="/favoritos">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 bg-red-500 text-muted-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold p-0"
                  >
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <CartDrawer>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                aria-label={`Carrinho de compras${getCartCount() > 0 ? ` com ${getCartCount()} ${getCartCount() === 1 ? 'item' : 'itens'}` : ' vazio'}`}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {getCartCount() > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 bg-accent-neon text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse p-0"
                    aria-hidden="true"
                  >
                    {getCartCount()}
                  </Badge>
                )}
              </Button>
            </CartDrawer>
          </div>

          {/* Mobile menu button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background shadow-lg backdrop-blur-sm">
          <div className="container py-4 space-y-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Home
              </Link>
              <Link to="/catalogo" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Capacetes
              </Link>
              
              {/* Vestuário Mobile Menu */}
              <div className="space-y-2">
                <Link to="/vestuario" className="text-sm font-medium transition-colors hover:text-accent-neon block">
                  Vestuário
                </Link>
                <div className="pl-4 space-y-1 border-l-2 border-border">
                  <Link to="/vestuario?category=luvas" className="text-xs text-muted-foreground transition-colors hover:text-accent-neon block">
                    Luvas
                  </Link>
                  <Link to="/vestuario?category=calças" className="text-xs text-muted-foreground transition-colors hover:text-accent-neon block">
                    Calças
                  </Link>
                  <Link to="/vestuario?category=macacão" className="text-xs text-muted-foreground transition-colors hover:text-accent-neon block">
                    Macacão
                  </Link>
                  <Link to="/vestuario?category=botas" className="text-xs text-muted-foreground transition-colors hover:text-accent-neon block">
                    Botas
                  </Link>
                  <Link to="/vestuario?category=balaclava" className="text-xs text-muted-foreground transition-colors hover:text-accent-neon block">
                    Balaclava
                  </Link>
                  <Link to="/vestuario?category=segunda-pele" className="text-xs text-muted-foreground transition-colors hover:text-accent-neon block">
                    Segunda Pele
                  </Link>
                  <Link to="/vestuario?category=capa-de-chuva" className="text-xs text-muted-foreground transition-colors hover:text-accent-neon block">
                    Capa de Chuva
                  </Link>
                </div>
              </div>
              
              <Link to="/jaquetas" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Jaquetas
              </Link>
              <Link to="/promocoes" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Promoções
              </Link>
              <Link to="/favoritos" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Favoritos
              </Link>
              <Link to="/contato" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Contato
              </Link>
            </div>
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-10 bg-background/50 border-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">{profile?.full_name || "Usuário"}</span>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sair
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="premium" size="sm">
                    Entrar
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center space-x-2">
                {/* Mobile Favorites */}
                <Link to="/favoritos">
                  <Button variant="ghost" size="icon" className="relative">
                    <Heart className="h-5 w-5" />
                    {favorites.length > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 bg-red-500 text-muted-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold p-0"
                      >
                        {favorites.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                {/* Mobile Cart */}
                <CartDrawer>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {getCartCount() > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 bg-accent-neon text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold p-0"
                      >
                        {getCartCount()}
                      </Badge>
                    )}
                  </Button>
                </CartDrawer>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
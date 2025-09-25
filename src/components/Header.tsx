import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X, LogOut, UserCircle, Package, Settings, Shield, Heart, Wifi } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            Catálogo
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
                placeholder="Buscar capacetes..."
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
                <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
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
                  <div className="py-2">
                    <DropdownMenuItem className="px-4 py-3 hover:bg-accent/5 transition-colors">
                      <UserCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Meu Perfil</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="px-4 py-3 hover:bg-accent/5 transition-colors">
                      <Link to="/pedidos" className="flex items-center w-full">
                        <Package className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Meus Pedidos</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {profile?.is_admin && (
                      <DropdownMenuItem asChild className="px-4 py-3 hover:bg-accent/5 transition-colors">
                        <Link to="/admin" className="flex items-center w-full">
                          <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Painel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                  </div>
                  
                  {/* Separator */}
                  <div className="border-t border-border/50"></div>
                  
                  {/* Logout */}
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="px-4 py-3 text-destructive hover:bg-destructive/5 transition-colors"
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
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Home
              </Link>
              <Link to="/catalogo" className="text-sm font-medium transition-colors hover:text-accent-neon">
                Catálogo
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
                placeholder="Buscar capacetes..."
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
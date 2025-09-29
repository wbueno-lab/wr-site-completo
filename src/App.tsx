import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, RouteProps } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import CatalogPage from "./pages/CatalogPage";
import VestuarioPage from "./pages/VestuarioPage";
import JaquetasPage from "./pages/JaquetasPage";
import PromotionsPage from "./pages/PromotionsPage";
import ContactPage from "./pages/ContactPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrdersPage from "./pages/OrdersPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutFailure from "./pages/CheckoutFailure";
import CheckoutPending from "./pages/CheckoutPending";
import LogoutTestPage from "./pages/LogoutTestPage";
import AuthDiagnosticPage from "./pages/AuthDiagnosticPage";
import { AdminAccessDiagnosticPage } from "./pages/AdminAccessDiagnosticPage";
import { AdminEmergencyPage } from "./pages/AdminEmergencyPage";
import { AuthProvider } from "./contexts/UnifiedAuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import { CartProviderWrapper } from "./components/CartProviderWrapper";
import { I18nProvider } from "./contexts/I18nContext";

const queryClient = new QueryClient();

const App = () => {
  console.log('🔄 App: Componente App renderizado');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <AuthProvider>
            <FavoritesProvider>
              <RealtimeProvider>
                <CartProviderWrapper>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <PageTransition>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/catalogo" element={<CatalogPage />} />
                        <Route path="/vestuario" element={<VestuarioPage />} />
                        <Route path="/jaquetas" element={<JaquetasPage />} />
                        <Route path="/produto/:id" element={<ProductDetailPage />} />
                        <Route path="/promocoes" element={<PromotionsPage /> as RouteProps['element']} />
                        <Route path="/favoritos" element={<FavoritesPage />} />
                        <Route 
                          path="/admin" 
                          element={
                            <ProtectedRoute requireAdmin={true} redirectTo="/">
                              <AdminPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/pedidos" 
                          element={
                            <ProtectedRoute>
                              <OrdersPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/contato" element={<ContactPage />} />
                        <Route 
                          path="/checkout/success" 
                          element={
                            <ProtectedRoute>
                              <CheckoutSuccess />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/checkout/failure" 
                          element={
                            <ProtectedRoute>
                              <CheckoutFailure />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/checkout/pending" 
                          element={
                            <ProtectedRoute>
                              <CheckoutPending />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/logout-test" element={<LogoutTestPage />} />
                        <Route path="/auth-diagnostic" element={<AuthDiagnosticPage />} />
                        <Route path="/admin-diagnostic" element={<AdminAccessDiagnosticPage />} />
                        <Route path="/admin-emergency" element={<AdminEmergencyPage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </PageTransition>
                  </BrowserRouter>
                </CartProviderWrapper>
              </RealtimeProvider>
            </FavoritesProvider>
          </AuthProvider>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
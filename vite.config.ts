import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Definir variáveis de ambiente para o cliente
const define = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://fflomlvtgaqbzrjnvqaz.supabase.co'),
  'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmbG9tbHZ0Z2FxYnpyam52cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI2MjcsImV4cCI6MjA3MzEzODYyN30.AjI-ZeoLswTl9D7EsjW1y2vZoctX0CSDI2B_FVXKkd4'),
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    hmr: {
      port: 8080,
      host: 'localhost',
      clientPort: 8080
    },
    headers: {
      // Headers de segurança
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // CORS headers
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      // CSP para permitir conexões WebSocket do Supabase, API dos Correios, Mercado Pago e Google Fonts
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://*.supabase.co https://api.supabase.com https://api.mercadopago.com https://viacep.com.br https://ws.correios.com.br http://ws.correios.com.br https://*.correios.com.br http://*.correios.com.br wss://*.supabase.co ws://localhost:* wss://localhost:8080 http://localhost:8080; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://secure.mlstatic.com; img-src 'self' data: blob: https: http:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://sdk.mercadopago.com; font-src 'self' https://fonts.gstatic.com data:; frame-src 'self' https://sdk.mercadopago.com https://secure.mlstatic.com;",
    },
    // Configurações de CORS
    cors: {
      origin: true,
      credentials: true,
    },
    // Configurações de proxy para evitar problemas de CORS
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  define,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurações de build para produção
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox'
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    // Otimizações de build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
    },
    // Configurações de chunk size
    chunkSizeWarningLimit: 1000,
    // Otimizações de assets
    assetsInlineLimit: 4096,
  },
}));

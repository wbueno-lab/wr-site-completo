import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startCacheCleanup } from './lib/imageCache';
import { initializeErrorHandler } from './utils/errorHandler';

// Inicializar sistema de tratamento de erros (modo otimizado)
initializeErrorHandler();

// Inicializar limpeza de cache de imagens
startCacheCleanup();

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Polyfill para corrigir o erro de MessagePort
if (typeof window !== 'undefined') {
  // Verificar se há problemas com MessagePort
  const originalMessagePort = window.MessagePort;
  if (originalMessagePort) {
    try {
      // Garantir que MessagePort.prototype.postMessage está definido corretamente
      if (typeof originalMessagePort.prototype.postMessage !== 'function') {
        console.warn('Corrigindo MessagePort.prototype.postMessage');
        originalMessagePort.prototype.postMessage = function(...args) {
          if (this.postMessage && this !== window) {
            return this.postMessage(...args);
          }
        };
      }
    } catch (e) {
      console.error('Erro ao corrigir MessagePort:', e);
    }
  }
}

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill para corrigir o erro de MessagePort
if (typeof MessagePort !== 'undefined') {
  const originalPostMessage = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function(...args) {
    if (args.length === 0) {
      throw new Error('Failed to execute "postMessage" on "MessagePort": 1 argument required, but only 0 present.');
    }
    try {
      originalPostMessage.apply(this, args);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('is not a valid transferable object')) {
        // Tenta novamente sem o segundo argumento (transferáveis)
        originalPostMessage.call(this, args[0]);
      } else {
        throw error;
      }
    }
  }
}

createRoot(document.getElementById("root")!).render(<App />);

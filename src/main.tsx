import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill para corrigir o erro de MessagePort
if (typeof MessagePort !== 'undefined') {
  const originalPostMessage = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function(...args) {
    if (args.length === 0) {
      console.warn('MessagePort.postMessage called without arguments, ignoring call');
      return;
    }
    try {
      originalPostMessage.apply(this, args);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('is not a valid transferable object')) {
        // Tenta novamente sem o segundo argumento (transferáveis)
        try {
          originalPostMessage.call(this, args[0]);
        } catch (retryError) {
          console.warn('MessagePort.postMessage failed:', retryError);
        }
      } else {
        console.warn('MessagePort.postMessage error:', error);
      }
    }
  };
}

createRoot(document.getElementById("root")!).render(<App />);

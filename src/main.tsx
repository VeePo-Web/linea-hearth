import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Clear any stale chunk-reload flag once the app boots successfully
try { sessionStorage.removeItem("loj:chunk-reload"); } catch {}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

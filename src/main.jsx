import { setupPwaGuard } from "@/pwa/guard";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/debug/ErrorBoundary";
import "./globals.css";
import "nprogress/nprogress.css";
import { runSqlSelfTest } from "@/debug/sqlSelfTest";
import { clearWebviewOnDev } from "@/debug/clearWebview";

clearWebviewOnDev();
setupPwaGuard();

if (import.meta.env.DEV && import.meta.env.TAURI_PLATFORM) {
  import("@/debug/check-capabilities-runtime");
}

runSqlSelfTest().catch(console.error);

if (
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  !import.meta.env.TAURI_PLATFORM
) {
  console.warn(
    "Vous êtes dans le navigateur. Ouvrez l’app dans la fenêtre Tauri pour activer SQLite."
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

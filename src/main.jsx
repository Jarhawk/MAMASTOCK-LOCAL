import { setupPwaGuard } from "@/pwa/guard";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/debug/ErrorBoundary";
import "./globals.css";
import "nprogress/nprogress.css";
import { runSqlSelfTest } from "@/debug/sqlSelfTest";
import { clearWebviewOnDev } from "@/debug/clearWebview";
import { isTauri } from "@/lib/runtime/isTauri";

clearWebviewOnDev();
setupPwaGuard();

if (import.meta.env.DEV && isTauri) {
  import("@/debug/check-capabilities-runtime");
}

runSqlSelfTest().catch(() => {});

if (
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  !isTauri
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

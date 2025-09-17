import { setupPwaGuard } from "@/pwa/guard";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/debug/ErrorBoundary";
import "./globals.css";
import "nprogress/nprogress.css";
import { runSqlSelfTest } from "@/debug/sqlSelfTest";
import { clearWebviewOnDev } from "@/debug/clearWebview";
import { isTauri } from "@/lib/tauriEnv";

clearWebviewOnDev();
setupPwaGuard();

// CODEREVIEW: warn when WebView2 runtime is missing to help support teams
function setupWebviewDiagnostics() {
  if (!isTauri()) return;
  let warned = false;
  const logHint = (source, detail) => {
    if (warned) return;
    warned = true;
    console.error(
      `[webview] ${source}: le runtime Microsoft Edge WebView2 semble manquant. ` +
        "L'installateur est configuré pour télécharger automatiquement le bootstrapper (webviewInstallMode: \"downloadBootstrapper\").",
      detail
    );
  };
  const matches = (value) => {
    if (!value) return false;
    const text = String(value).toLowerCase();
    return text.includes("webview2") || text.includes("createwebview");
  };
  window.addEventListener("error", (event) => {
    if (matches(event?.message) || matches(event?.error)) {
      logHint("error", event?.error ?? event?.message);
    }
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (matches(event?.reason)) {
      logHint("unhandledrejection", event?.reason);
    }
  });
}

setupWebviewDiagnostics();

if (import.meta.env.DEV && isTauri()) {
  import("@/debug/dbIntrospect");
  import("@/debug/check-capabilities-runtime");
}

runSqlSelfTest().catch(() => {});

if (
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  !isTauri()
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

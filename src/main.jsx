// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
// Polyfills Node → navigateur
import { Buffer } from "buffer";
import process from "process";
// @ts-ignore
window.Buffer = Buffer;
// @ts-ignore
window.process = process;

// === Debug global errors ===
import { appendLog } from "@/debug/logger";
window.addEventListener('error', (e) => {
  appendLog('[GlobalError] ' + (e?.error?.stack || e?.message));
  console.error('[GlobalError]', e?.error || e?.message || e);
});
window.addEventListener('unhandledrejection', (e) => {
  appendLog('[UnhandledRejection] ' + (e?.reason?.stack || e?.reason));
  console.error('[UnhandledRejection]', e?.reason || e);
});
// === /Debug ===
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/debug/ErrorBoundary";
import "./globals.css";
import 'nprogress/nprogress.css';
import "@/i18n/i18n";
import "./registerSW.js";
import { HashRouter } from "react-router-dom";
import AuthProvider from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { ensureSingleOwner, monitorShutdownRequests, releaseLock } from "@/lib/lock";
import { shutdownDbSafely } from "@/lib/shutdown";
import { getDataDir } from "@/lib/db";
import { getCurrent } from "@tauri-apps/api/window";

window.addEventListener("keydown", (e) => {
  if (e.key === "F12") {
    try {
      getCurrent().openDevtools?.();
    } catch {}
  }
});

// Avoid noisy output in production by disabling debug logs
if (!import.meta.env.DEV) {
  console.debug = () => {};
}

if (import.meta?.env?.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()));
  if (window.caches?.keys) {
    caches
      .keys()
      .then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}

if (import.meta?.env?.DEV) {
  // @ts-ignore
  window.toast = toast;
}

// Option sentry/reporting
// import * as Sentry from "@sentry/react";
// Sentry.init({ dsn: "https://xxx.ingest.sentry.io/xxx" });

const dir = await getDataDir();
monitorShutdownRequests(dir);
await ensureSingleOwner(dir);
window.addEventListener("beforeunload", () => {
  shutdownDbSafely();
  releaseLock(dir);
});

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);

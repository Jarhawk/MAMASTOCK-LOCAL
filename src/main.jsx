// MamaStock Â© 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
// Polyfills Node â†’ navigateur
import { Buffer } from "buffer";
import process from "process";
// @ts-ignore
window.Buffer = Buffer;
// @ts-ignore
window.process = process;

import { attachConsole, info as logInfo } from "@tauri-apps/plugin-log";
import { emit } from "@tauri-apps/api/event";

// Raccourci clavier F12 pour demander au backend d'ouvrir DevTools
if (window.__TAURI__) {
  window.addEventListener('keydown', async (e) => {
    if (e.key === 'F12') {
      await emit('open-devtools');
    }
  });
}



attachConsole()
  .then(() => {
    logInfo("Frontend booted and console attached");
  })
  .catch((e) => {
    console.error("Failed to attach console to tauri-plugin-log", e);
  });

// === Debug global errors ===
import { appendLog } from "@/debug/logger";
function installGlobalErrorOverlay() {
  const style = document.createElement("style");
  style.textContent = `
    #__debug_overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      color: #fff; font: 14px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      padding: 16px; z-index: 999999; overflow: auto; display: none;
    }
    #__debug_overlay pre { white-space: pre-wrap; word-break: break-word; }
    #__debug_overlay .close { position:absolute; top:8px; right:12px; cursor:pointer; }
  `;
  document.head.appendChild(style);
  const el = document.createElement("div");
  el.id = "__debug_overlay";
  el.innerHTML = `<div class="close">âœ•</div><h3>Runtime error</h3><pre id="__debug_overlay_log"></pre>`;
  document.body.appendChild(el);
  el.querySelector(".close")?.addEventListener(
    "click",
    () => (el.style.display = "none"),
  );

  function show(type, err) {
    const pre = document.getElementById("__debug_overlay_log");
    const msg =
      (err && (err.stack || err.message || String(err))) ?? String(err);
    if (pre) {
      pre.textContent = msg;
      el.style.display = "block";
    }
    appendLog(`[${type}] ${msg}`);
    console.error("[Overlay]", err);
  }

  window.addEventListener("error", (e) =>
    show("GlobalError", e.error || e.message || e),
  );
  window.addEventListener("unhandledrejection", (e) =>
    show("UnhandledRejection", e.reason || e),
  );
  // Raccourci: F10 pour toggle
  window.addEventListener("keydown", (e) => {
    if (e.key === "F10") {
      const visible = el.style.display !== "none";
      el.style.display = visible ? "none" : "block";
    }
  });
  console.log("[debug] overlay installed");
}

installGlobalErrorOverlay();
// === /Debug ===
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/debug/ErrorBoundary";
import "./globals.css";
import "nprogress/nprogress.css";
import "@/i18n/i18n";
import "./registerSW.js";
import { HashRouter } from "react-router-dom";
import AuthProvider from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ensureSingleOwner,
  monitorShutdownRequests,
  releaseLock,
} from "@/lib/lock";
import { shutdownDbSafely } from "@/lib/shutdown";
import { getDataDir } from "@/lib/db";

// Avoid noisy output in production by disabling debug logs
if (!import.meta.env.DEV) {
  console.debug = () => {};
}

if (import.meta?.env?.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()));
  if (window.caches?.keys) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
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
  </StrictMode>,
);

if (window.__TAURI__) {
  window.addEventListener('keydown', async (e) => {
    if (e.key === 'F12') {
      try {
        await emit('open-devtools');
      } catch (err) {
        console.error('emit(""open-devtools"") failed', err);
      }
    }
  });
}


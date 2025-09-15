import { isTauri } from "@/lib/runtime/isTauri"; // src/debug/kill-sw.ts
// Désactive TOUT service worker + vide le cache, le plus tôt possible.
// S’exécute en dev sous localhost:5173 et dans la WebView (tauri.localhost).
;(function killSW() {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs?.forEach((r) => r.unregister().catch(() => {}));
      });
    }
    // Clear caches API si dispo
    (async () => {
      try {
        const keys = await (globalThis as any).caches?.keys?.();
        if (Array.isArray(keys)) {
          for (const k of keys) {
            await (globalThis as any).caches?.delete?.(k);
          }
        }
      } catch {}
    })();
  } catch {}
  // Hard patch : neutralise toute tentative future d’enregistrement
  try {
    if ('serviceWorker' in navigator) {
      // @ts-ignore
      navigator.serviceWorker.register = () =>
      Promise.reject(new Error('SW disabled in dev'));
    }
  } catch {}
})();
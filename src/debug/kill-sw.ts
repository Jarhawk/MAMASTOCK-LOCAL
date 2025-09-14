// src/debug/kill-sw.ts
export async function unregisterAllSW() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        try { await r.unregister(); } catch {}
      }
    }
    // Purge caches
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
    }
    // Force reload une fois (évite boucles)
    const key = "__sw_killed_once__";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      location.reload();
    }
  } catch {}
}

if (import.meta.env.DEV || (window as any).__TAURI__) {
  unregisterAllSW();
}

import { isTauri } from "@/lib/tauriEnv";

export async function clearWebviewOnDev() {
  if (!import.meta.env.PROD && isTauri()) {
    try {
      const mod = await import("@tauri-apps/api/webview");
      const clear = (mod as any)?.clearAllBrowsingData;
      if (typeof clear === "function") {
        await clear();
        console.info("[WebView] browsing data cleared (dev)");
      }
    } catch {}
  }
}

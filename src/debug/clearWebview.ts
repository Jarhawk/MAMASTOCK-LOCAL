export async function clearWebviewOnDev() {
  if (!import.meta.env.PROD) {
    try {
      const mod = await import("@tauri-apps/api/webview");
      if (mod?.clearAllBrowsingData) {
        await mod.clearAllBrowsingData();
        console.info("[WebView] browsing data cleared (dev)");
      }
    } catch {}
  }
}

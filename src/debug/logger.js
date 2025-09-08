/* Safe logger stub for Tauri */
if (typeof window !== "undefined" && window.__TAURI__) {
  (async () => {
    try {
      const mod = await import("@tauri-apps/plugin-log");
      if (mod && typeof mod.attachConsole === "function") {
        await mod.attachConsole();
      }
    } catch (e) {
      console.warn("[logger] plugin-log non disponible:", e);
    }
  })();
}

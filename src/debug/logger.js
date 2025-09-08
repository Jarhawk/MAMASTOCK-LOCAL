/** Logger Tauri sûr (no-op si plugin absent) */
export async function appendLog(msg, level = "info") {
  let text = typeof msg === "string" ? msg : (() => { try { return JSON.stringify(msg); } catch { return String(msg); } })();
  try {
    const mod = await import("@tauri-apps/plugin-log");
    if (level === "error" && typeof mod.error === "function") return mod.error(text);
    if (level === "warn"  && typeof mod.warn  === "function")  return mod.warn(text);
    if (typeof mod.info === "function") return mod.info(text);
  } catch {
    if (level === "error") return console.error(text);
    if (level === "warn")  return console.warn(text);
    return console.log(text);
  }
}
export async function attachConsoleSafe() {
  try { const { attachConsole } = await import("@tauri-apps/plugin-log"); if (attachConsole) await attachConsole(); } catch {}
}
attachConsoleSafe();
export default { appendLog, attachConsoleSafe };

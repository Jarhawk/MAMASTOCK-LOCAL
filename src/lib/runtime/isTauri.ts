/* src/lib/runtime/isTauri.ts */
export function detectTauriRuntime(): boolean {
  try {
    // signal d’injection Tauri
    if (typeof (globalThis as any).__TAURI__ !== "undefined") return true;
    if (typeof (globalThis as any).__TAURI_INTERNALS__ !== "undefined") return true;

    // certains environnements ajoutent "Tauri" au userAgent
    if (typeof navigator !== "undefined" && /Tauri/i.test(navigator.userAgent)) return true;

    // fallback: variable d'env bundler si dispo
    // (mais ne pas s'y fier uniquement)
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env && "TAURI_PLATFORM" in import.meta.env) {
      // @ts-ignore
      return !!import.meta.env.TAURI_PLATFORM;
    }
  } catch {}
  return false;
}
export const isTauri = detectTauriRuntime();

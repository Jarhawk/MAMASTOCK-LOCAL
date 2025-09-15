import { isTauri } from "@/lib/runtime/isTauri";

export function logTauriBootCheck(tag = "[BootCheck]") {
  try {
    // @ts-ignore
    const hasTauri = typeof (globalThis as any).__TAURI__ !== "undefined";
    // @ts-ignore
    const hasInternals = typeof (globalThis as any).__TAURI_INTERNALS__ !== "undefined";
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "n/a";
    // @ts-ignore
    const envPlat = (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.TAURI_PLATFORM || null)) || null;

    console.info(tag, { isTauri, hasTauri, hasInternals, ua, envPlat });
  } catch (e) {
    console.warn(tag, "check error:", e);
  }
}

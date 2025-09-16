// src/lib/tauriEnv.ts
// Détection Tauri robuste (dev/prod, v2).
export function isTauri(): boolean {
  try {
    if ((import.meta as any)?.env?.TAURI_PLATFORM) return true;
  } catch (_) {}

  if (typeof window !== "undefined" && (window as any).__TAURI__) return true;
  if (typeof navigator !== "undefined" && /Tauri/i.test(navigator.userAgent)) return true;
  if (typeof location !== "undefined" && location.protocol.startsWith("tauri")) return true;

  return false;
}

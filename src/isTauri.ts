export function isTauri() {
  return typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
}

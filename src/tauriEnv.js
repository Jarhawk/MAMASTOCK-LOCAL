export const isTauri = () => {
  // Tauri v2 expose __TAURI_INTERNALS__ et __TAURI__
  return !!(window.__TAURI__ || window.__TAURI_INTERNALS__)
}

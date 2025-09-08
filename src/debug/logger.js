export async function initTauriLogger() {
  try {
    const isTauri = ('__TAURI__' in window) || ('__TAURI_INTERNALS__' in window);
    if (!isTauri) return;          // navigateur pur
    if (import.meta.env.DEV) return; // en DEV: pas de plugin côté Rust

    const { attachConsole } = await import('@tauri-apps/plugin-log');
    await attachConsole();
    console.info('[log] plugin attachConsole OK');
  } catch (e) {
    console.warn('[log] plugin non disponible:', e?.message || e);
  }
}

export async function appendLog(msg, level = 'info') {
  const text = typeof msg === 'string'
    ? msg
    : (() => {
        try {
          return JSON.stringify(msg);
        } catch {
          return String(msg);
        }
      })();
  try {
    const mod = await import('@tauri-apps/plugin-log');
    if (level === 'error' && typeof mod.error === 'function') return mod.error(text);
    if (level === 'warn' && typeof mod.warn === 'function') return mod.warn(text);
    if (typeof mod.info === 'function') return mod.info(text);
  } catch {
    if (level === 'error') return console.error(text);
    if (level === 'warn') return console.warn(text);
    return console.log(text);
  }
}

export default { initTauriLogger, appendLog };

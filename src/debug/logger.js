export async function setupLogger() {
  try {
    const log = await import('@tauri-apps/plugin-log');
    // En dev: voir les logs dans la console
    await log.attachConsole();
    // Optionnel: activer un fichier de log natif
    // await log.attachLogger();
    log.info?.('Logger initialisé');
  } catch (e) {
    console.warn('[log] plugin non dispo – logging désactivé', e);
  }
}

export async function appendLog(msg, level = 'info') {
  const text =
    typeof msg === 'string'
      ? msg
      : (() => {
          try {
            return JSON.stringify(msg);
          } catch {
            return String(msg);
          }
        })();
  try {
    const log = await import('@tauri-apps/plugin-log');
    if (level === 'error' && typeof log.error === 'function') return log.error(text);
    if (level === 'warn' && typeof log.warn === 'function') return log.warn(text);
    if (typeof log.info === 'function') return log.info(text);
  } catch {
    if (level === 'error') return console.error(text);
    if (level === 'warn') return console.warn(text);
    return console.log(text);
  }
}


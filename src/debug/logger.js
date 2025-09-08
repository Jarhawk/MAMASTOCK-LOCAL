import { isTauri } from '../tauriEnv'

export async function setupLogging() {
  // Pas de plugins si pas dans Tauri
  if (!isTauri()) return

  // On évite le plugin log en dev pour supprimer les collisions d'init
  if (import.meta.env.MODE === 'development') {
    console.debug('[log] dev mode: skip tauri-plugin-log')
    return
  }

  try {
    const log = await import('@tauri-apps/plugin-log')
    // await log.attachConsole() // seulement si besoin
    await log.info('logging initialized (release)')
  } catch (e) {
    console.warn('[log] plugin log not available:', e)
  }
}

export async function appendLog(msg, level = 'info') {
  const text = typeof msg === 'string'
    ? msg
    : (() => {
        try {
          return JSON.stringify(msg)
        } catch {
          return String(msg)
        }
      })()

  // Fallback console si pas de plugin ou en dev
  if (!isTauri() || import.meta.env.MODE === 'development') {
    if (level === 'error') return console.error(text)
    if (level === 'warn') return console.warn(text)
    return console.log(text)
  }

  try {
    const log = await import('@tauri-apps/plugin-log')
    if (level === 'error' && typeof log.error === 'function') return log.error(text)
    if (level === 'warn' && typeof log.warn === 'function') return log.warn(text)
    if (typeof log.info === 'function') return log.info(text)
  } catch (e) {
    console.warn('[log] plugin log not available:', e)
  }
}

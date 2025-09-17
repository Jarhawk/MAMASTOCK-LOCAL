import { isTauri } from "@/lib/tauriEnv";

export type LogApi = {
  info: (...args: any[]) => any;
  warn: (...args: any[]) => any;
  error: (...args: any[]) => any;
  debug?: (...args: any[]) => any;
  trace?: (...args: any[]) => any;
};

let api: Partial<LogApi> | null = null;
let initPromise: Promise<void> | null = null;

async function loadPlugin() {
  if (!isTauri() || !import.meta.env.PROD) {
    api = null;
    return;
  }

  try {
    api = (await import("@tauri-apps/plugin-log")) as unknown as LogApi;
  } catch (err) {
    console.warn("[log] Plugin log indisponible:", err);
    api = null;
  }
}

export async function initLog() {
  if (initPromise) return initPromise;
  initPromise = loadPlugin();
  return initPromise;
}

function passToConsole(fn: keyof Console, ...args: any[]) {
  const method = console[fn] ?? console.log;
  return method.apply(console, args);
}

export const log: LogApi = {
  info: (...args) => (api && api.info ? api.info(...args) : passToConsole("info", ...args)),
  warn: (...args) => (api && api.warn ? api.warn(...args) : passToConsole("warn", ...args)),
  error: (...args) => (api && api.error ? api.error(...args) : passToConsole("error", ...args)),
  debug: (...args) =>
    (api && api.debug ? api.debug(...args) : passToConsole("debug", ...args)),
  trace: (...args) =>
    (api && api.trace ? api.trace(...args) : passToConsole("trace", ...args)),
};

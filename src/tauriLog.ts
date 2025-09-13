export type LogApi = {
  info: (...a: any[]) => any;
  warn: (...a: any[]) => any;
  error: (...a: any[]) => any;
  debug?: (...a: any[]) => any;
  trace?: (...a: any[]) => any;
};

let api: Partial<LogApi> | null = null;

import { isTauri } from "@/lib/db/sql";

export async function initLog() {
  if (isTauri && import.meta.env.PROD) {
    try {
      api = (await import("@tauri-apps/plugin-log")) as any;
    } catch {
      api = null;
    }
  }
}

function passToConsole(fn: keyof Console, ...a: any[]) {
  (console[fn] ?? console.log)(...a);
}

export const log: LogApi = {
  info:  (...a) => (api && (api as any).info)  ? (api as any).info(...a)  : passToConsole("info",  ...a),
  warn:  (...a) => (api && (api as any).warn)  ? (api as any).warn(...a)  : passToConsole("warn",  ...a),
  error: (...a) => (api && (api as any).error) ? (api as any).error(...a) : passToConsole("error", ...a),
  debug: (...a) => (api && (api as any).debug) ? (api as any).debug(...a) : passToConsole("debug", ...a),
  trace: (...a) => (api && (api as any).trace) ? (api as any).trace(...a) : passToConsole("trace", ...a),
};

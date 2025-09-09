import { isTauri } from "@/lib/isTauri";

type Logger = { info: (...a: any[]) => void; error: (...a: any[]) => void };

let logger: Logger = console;

async function init() {
  if (isTauri) {
    try {
      const mod = await import("@tauri-apps/plugin-log");
      logger = { info: mod.info, error: mod.error };
    } catch {
      logger = console;
    }
  }
}

await init();

export const log = {
  info: (...a: any[]) => logger.info(...a),
  error: (...a: any[]) => logger.error(...a),
};

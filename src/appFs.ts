import { configPath } from "@/lib/paths";
import { isTauri } from "@/tauriEnv";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export type Config = Record<string, any>;
const LS_KEY = "config.json";

export async function readConfig(): Promise<Config | null> {
  if (!isTauri()) {
    const v = localStorage.getItem(LS_KEY);
    return v ? JSON.parse(v) : null;
  }
  const path = await configPath();
  if (!(await exists(path))) return null;
  try {
    const txt = await readTextFile(path);
    return JSON.parse(txt) as Config;
  } catch {
    return null;
  }
}

export async function writeConfig(cfg: Config): Promise<void> {
  if (!isTauri()) {
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    return;
  }
  const path = await configPath();
  await writeTextFile(path, JSON.stringify(cfg, null, 2));
}

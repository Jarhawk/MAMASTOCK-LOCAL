import { isTauri } from "./tauriEnv";

let fs: any = null;
let join: any = null;
let appDataDir: any = null;

async function ensureImports() {
  if (!isTauri()) return;
  if (!fs) {
    fs = await import("@tauri-apps/plugin-fs");
  }
  if (!join || !appDataDir) {
    const pathApi = await import("@tauri-apps/api/path");
    join = pathApi.join;
    appDataDir = pathApi.appDataDir;
  }
}

async function tauriConfigPath() {
  await ensureImports();
  const base = await appDataDir();
  const folder = await join(base, "MamaStock");
  const mkdir = (fs as any).mkdir || (fs as any).createDir; // compat
  await mkdir(folder, { recursive: true });
  return await join(folder, "config.json");
}

const LS_KEY = "MamaStock.config.json";

export type Config = Record<string, any>;

export async function readConfig(): Promise<Config | null> {
  if (!isTauri()) {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : null;
  }
  await ensureImports();
  try {
    const file = await tauriConfigPath();
    const exists = await fs.exists(file);
    if (!exists) return null;
    const txt = await fs.readTextFile(file);
    return JSON.parse(txt);
  } catch (_) {
    return null;
  }
}

export async function writeConfig(cfg: Config): Promise<void> {
  if (!isTauri()) {
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    return;
  }
  await ensureImports();
  const file = await tauriConfigPath();
  await fs.writeTextFile(file, JSON.stringify(cfg, null, 2));
}

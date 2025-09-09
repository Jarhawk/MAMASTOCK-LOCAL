import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

export const APP_DIR = "MamaStock";

export async function ensureAppDir(): Promise<string> {
  const base = await appDataDir();
  const dir = await join(base, APP_DIR);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return dir;
}

export async function appDataPath(...parts: string[]) {
  const dir = await ensureAppDir();
  let p = dir;
  for (const part of parts) p = await join(p, part);
  return p;
}

// src/lib/paths.ts
import { appDataDir, join } from "@tauri-apps/api/path";
export const APP_DIR = "MamaStock";
export async function getAppDir() {
  const base = await appDataDir();
  return join(base, APP_DIR);
}
export async function inAppDir(...parts: string[]) {
  const root = await getAppDir();
  let p = root;
  for (const part of parts) p = await join(p, part);
  return p;
}
export async function dataDbPath() { return inAppDir("data", "mamastock.db"); }
export async function configPath() { return inAppDir("config.json"); }
export async function locksPath()  { return inAppDir("data", "db.lock.json"); }

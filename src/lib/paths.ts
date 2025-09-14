// src/lib/paths.ts
import { isTauri } from "@/lib/db/sql";
export const APP_DIR = "MamaStock";
export async function getAppDir() {
  if (!isTauri) throw new Error("Tauri requis");
  const { appDataDir, join } = await import("@tauri-apps/api/path");
  const base = await appDataDir();
  return join(base, APP_DIR);
}
export async function inAppDir(...parts: string[]) {
  if (!isTauri) throw new Error("Tauri requis");
  const root = await getAppDir();
  const { join } = await import("@tauri-apps/api/path");
  let p = root;
  for (const part of parts) p = await join(p, part);
  return p;
}
export async function dataDbPath() { return inAppDir("data", "mamastock.db"); }
export async function configPath() { return inAppDir("config.json"); }
export async function locksPath()  { return inAppDir("data", "db.lock.json"); }

// src/lib/paths.ts
import { isTauri } from "@/lib/runtime/isTauri";

const NOT_TAURI_HINT =
  "Vous êtes dans le navigateur de développement. Ouvrez la fenêtre Tauri pour activer SQLite.";
export const APP_DIR = "MamaStock";
export async function getAppDir() {
  if (!isTauri) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const { appDataDir, join } = await import("@tauri-apps/api/path");
  const base = await appDataDir();
  return join(base, APP_DIR);
}
export async function inAppDir(...parts: string[]) {
  if (!isTauri) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const root = await getAppDir();
  const { join } = await import("@tauri-apps/api/path");
  let p = root;
  for (const part of parts) p = await join(p, part);
  return p;
}
export async function dataDbPath() { return inAppDir("data", "mamastock.db"); }
export async function configPath() { return inAppDir("config.json"); }
export async function locksPath()  { return inAppDir("data", "db.lock.json"); }

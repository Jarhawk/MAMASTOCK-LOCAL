// src/lib/db/sql.ts
import { appDataDir, homeDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

export const isTauri = !!import.meta.env.TAURI_PLATFORM;

const DB_NAME = "mamastock.db";
const APP_FOLDER = "MamaStock";
const DATA_FOLDER = "data";

let _db: Database | null = null;

async function ensureDir(p: string) {
  if (!(await exists(p))) await mkdir(p, { recursive: true });
}

export async function locateDb() {
  if (!isTauri) throw new Error("Tauri requis pour SQLite");

  // 1) PRIORITÉ : ~/MamaStock/data/mamastock.db (utilisé par les scripts Node)
  const home = await homeDir();
  const homeRoot = await join(home, APP_FOLDER, DATA_FOLDER);
  const homeFile = await join(homeRoot, DB_NAME);
  if (await exists(homeFile)) {
    return { file: homeFile, url: "sqlite:" + homeFile, location: "home" as const };
  }

  // 2) RETOMBÉE : %APPDATA%/com.mamastock.local/MamaStock/data/mamastock.db
  const base = await appDataDir(); // pointe déjà sur ...\com.mamastock.local\
  const dataDir = await join(base, APP_FOLDER, DATA_FOLDER);
  await ensureDir(dataDir);
  const appFile = await join(dataDir, DB_NAME);
  return { file: appFile, url: "sqlite:" + appFile, location: "appdata" as const };
}

export async function getDb() {
  if (!isTauri) throw new Error("Vous êtes dans le navigateur. Ouvrez la fenêtre Tauri pour SQLite.");
  if (_db) return _db;
  const { url, file, location } = await locateDb();
  console.info("[SQLite] open", { file, location });
  _db = await Database.load(url);
  return _db;
}

// Helpers utiles
export async function tableExists(name: string) {
  const db = await getDb();
  const rows = await db.select("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [name]);
  return rows.length > 0;
}

export async function selectValue<T = any>(sql: string, params: any[] = []) {
  const db = await getDb();
  const rows = (await db.select(sql, params)) as any[];
  if (!rows.length) return null as T | null;
  const first = rows[0];
  const key = Object.keys(first)[0];
  return first[key] as T;
}

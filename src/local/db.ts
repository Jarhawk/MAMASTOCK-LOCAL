// src/local/db.ts
import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

const APP_DIR = "MamaStock";
const DB_FILE = "mamastock.db";

let _db: any;

async function dbPath() {
  const base = await appDataDir();
  const dir = await join(base, APP_DIR);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return await join(dir, DB_FILE);
}

export async function getDb() {
  if (_db) return _db;
  const file = await dbPath();
  // plugin-sql accepte un chemin absolu après "sqlite:"
  _db = await Database.load(`sqlite:${file}`);
  return _db;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  return await db.select<T[]>(sql, params);
}

export async function exec(sql: string, params: any[] = []): Promise<void> {
  const db = await getDb();
  await db.execute(sql, params);
}

export async function one<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length ? rows[0] : null;
}

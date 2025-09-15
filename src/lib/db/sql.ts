import type { Database } from "@tauri-apps/plugin-sql";

export const isTauri =
  typeof window !== "undefined" &&
  (location.protocol === "tauri:" || !!import.meta.env.TAURI_PLATFORM);

let _db: Database | null = null;
const DB_PATH = "C:/Users/dark_/MamaStock/data/mamastock.db";

export async function getDb(): Promise<Database> {
  if (!isTauri) {
    throw new Error("Tauri required: open the native window");
  }
  if (_db) return _db;
  const { Database } = await import("@tauri-apps/plugin-sql");
  _db = await Database.load("sqlite:" + DB_PATH);
  return _db;
}

export async function closeDb() {
  if (!_db) return;
  try {
    await _db.close();
  } finally {
    _db = null;
  }
}

export async function tableCount(name: string): Promise<number> {
  try {
    const db = await getDb();
    const rows: any = await db.select(`SELECT COUNT(*) AS c FROM ${name}`);
    return rows?.[0]?.c ?? 0;
  } catch {
    return 0;
  }
}

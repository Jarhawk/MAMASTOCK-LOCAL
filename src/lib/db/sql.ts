import type { Database } from "@tauri-apps/plugin-sql";

const NOT_TAURI_HINT =
  "Vous êtes dans le navigateur de développement. Ouvrez la fenêtre Tauri pour activer SQLite.";

export const isTauri =
  typeof window !== "undefined" &&
  (location.protocol === "tauri:" || !!import.meta.env.TAURI_PLATFORM);

let _db: Database | null = null;
const DB_PATH = "C:/Users/dark_/MamaStock/data/mamastock.db";
const DB_URI = "sqlite:" + DB_PATH;

export async function getDb(): Promise<Database> {
  if (!isTauri) {
    console.warn(NOT_TAURI_HINT);
    return Promise.reject(new Error("SQLite indisponible hors Tauri"));
  }
  if (_db) return _db;
  const { Database } = await import("@tauri-apps/plugin-sql");
  _db = await Database.load(DB_URI);
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

export async function locateDb(): Promise<string> {
  return DB_URI;
}

export async function openDb(): Promise<Database> {
  return getDb();
}

let seedWarned = false;
export async function ensureSeeds() {
  try {
    const db = await getDb();
    await db.execute(
      "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);",
    );
    await db.execute(
      "INSERT OR IGNORE INTO meta(key, value) VALUES ('init','ok');",
    );
  } catch (err) {
    if (!seedWarned) {
      console.info("ensureSeeds failed", err);
      seedWarned = true;
    }
  }
}

export async function getMigrationsState(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const db = await getDb();
    await db.select("SELECT 1 AS ok");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

let _db: Database | null = null;

export async function dbPath() {
  const base = await appDataDir();                  // …\AppData\Roaming\<bundle>\  (Tauri)
  const dir  = await join(base, "MamaStock", "data");
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return await join(dir, "mamastock.db");
}

export async function getDb() {
  if (_db) return _db;
  const file = await dbPath();
  _db = await Database.load(`sqlite:${file}`);      // nécessite "sql:allow-load" + "sql:default"
  return _db!;
}

export async function getMeta(key: string) {
  const db = await getDb();
  const row = await db.select<{ value?: string }[]>(
    "SELECT value FROM meta WHERE key = ? LIMIT 1",
    [key]
  );
  return row?.[0]?.value ?? null;
}

export async function setMeta(key: string, value: string) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [key, value]
  );
}


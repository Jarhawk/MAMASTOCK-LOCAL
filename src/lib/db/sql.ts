import Database from "@tauri-apps/plugin-sql";

const isTauri = !!import.meta.env.TAURI_PLATFORM;

let _db: any;

export async function getDb() {
  if (!_db) {
    _db = await Database.load("sqlite:mamastock.db");
  }
  return _db;
}

export async function closeDb() {
  if (_db) {
    try {
      await _db.close();
    } finally {
      _db = undefined;
    }
  }
}

export async function selectOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const db = await getDb();
  const rows = (await db.select(sql, params)) as T[];
  return rows[0] ?? null;
}

export async function selectAll<T>(sql: string, params?: any[]): Promise<T[]> {
  const db = await getDb();
  return (await db.select(sql, params)) as T[];
}

export async function exec(sql: string, params?: any[]): Promise<void> {
  const db = await getDb();
  await db.execute(sql, params);
}

export async function tableCount(name: string): Promise<number> {
  const row = await selectOne<{ count: number }>(`SELECT COUNT(*) as count FROM ${name}`);
  return row?.count ?? 0;
}

export { isTauri };

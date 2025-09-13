import Database from "@tauri-apps/plugin-sql";

export const isTauri = !!import.meta.env.TAURI_PLATFORM;

let _db: any | null = null;
let _loading: Promise<any> | null = null;

export async function getDb() {
  if (!isTauri) throw new Error("Tauri required: run with `npx tauri dev`.");
  if (_db) return _db;
  if (_loading) return _loading;

  _loading = (async () => {
    try {
      // nécessite sql:allow-load
      const db = await Database.load("sqlite:mamastock.db");
      _db = db;
      return db;
    } catch (e:any) {
      // message typique => "sql.load not allowed. Permissions associated with this command: sql:allow-load, sql:default"
      console.error("[getDb] load failed:", e?.message ?? e);
      throw e;
    } finally {
      _loading = null;
    }
  })();

  return _loading;
}

export async function closeDb() {
  if (!_db) return;
  try { await _db.close?.(); } catch {}
  _db = null;
}

export async function selectOne<T=any>(sql: string, params: any[] = []): Promise<T|null> {
  const db = await getDb();
  const rows: T[] = await db.select(sql, params);
  return rows?.[0] ?? null;
}

export async function selectAll<T=any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  return await db.select(sql, params);
}

export async function exec(sql: string, params: any[] = []): Promise<void> {
  const db = await getDb();
  await db.execute(sql, params);
}

export async function tableCount(name: string): Promise<number> {
  const row = await selectOne<{ c:number }>(`SELECT COUNT(*) AS c FROM ${name}`);
  return row?.c ?? 0;
}

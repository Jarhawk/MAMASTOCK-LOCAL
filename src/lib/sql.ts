import Database from "@tauri-apps/plugin-sql";

type Row = Record<string, unknown>;
export type Changes = { changes: number; lastInsertId?: number | null };

const isTauri = !!import.meta.env.TAURI_PLATFORM;
let _db: any | null = null;

export async function getDb() {
  if (!isTauri) {
    throw new Error("Tauri required: run via `npx tauri dev` to access SQLite");
  }
  if (_db) return _db;
  _db = await Database.load("sqlite:mamastock.db");
  return _db;
}

export async function select<T extends Row = Row>(sql: string, args: unknown[] = []): Promise<T[]> {
  const db = await getDb();
  return (await db.select(sql, args)) as T[];
}

export async function get<T extends Row = Row>(sql: string, args: unknown[] = []): Promise<T | null> {
  const rows = await select<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: unknown[] = []): Promise<Changes> {
  const db = await getDb();
  // db.execute returns { rowsAffected, lastInsertId } in plugin-sql v2
  const res = await db.execute(sql, args);
  return { changes: res.rowsAffected ?? 0, lastInsertId: res.lastInsertId ?? null };
}

export async function tx<T>(fn: () => Promise<T>): Promise<T> {
  const db = await getDb();
  try {
    await db.execute("BEGIN");
    const out = await fn();
    await db.execute("COMMIT");
    return out;
  } catch (e) {
    try { await db.execute("ROLLBACK"); } catch {}
    throw e;
  }
}

// Convenience upserts (SQLite doesn't have true upsert everywhere; use INSERT ... ON CONFLICT):
export async function upsert(
  table: string,
  cols: string[],
  values: unknown[],
  conflictCols: string[],
  setCols?: string[]
) {
  const placeholders = cols.map(() => "?").join(",");
  const onConflict =
    conflictCols.length
      ? ` ON CONFLICT(${conflictCols.join(",")}) DO UPDATE SET ${
          (setCols ?? cols).map(c => `${c}=excluded.${c}`).join(",")
        }`
      : "";
  const sql = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})${onConflict};`;
  return run(sql, values);
}

// Guards for development to avoid silent failures:
export function assertTauri() {
  if (!isTauri) throw new Error("This action requires Tauri + plugin-sql.");
}

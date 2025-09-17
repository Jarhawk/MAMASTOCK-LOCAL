import {
  getDb,
  closeDb,
  locateDb,
  openDb,
  ensureSeeds,
  getMigrationsState,
  isTauriRuntime,
  type SqliteDatabase,
  type SqlDatabase,
} from "@/lib/db/sql";

export {
  getDb,
  closeDb,
  locateDb,
  openDb,
  ensureSeeds,
  getMigrationsState,
};

export { isTauriRuntime as isTauri };
export type { SqliteDatabase, SqlDatabase };

export async function tableCount(table: string): Promise<number> {
  const db = await getDb();
  const rows = (await db.select<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table}`
  )) as Array<{ count: number }>;
  const value = rows?.[0]?.count;
  return typeof value === "number" ? value : 0;
}

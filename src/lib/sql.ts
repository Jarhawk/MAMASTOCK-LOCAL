export {
  getDb,
  closeDb,
  locateDb,
  openDb,
  ensureSeeds,
  getMigrationsState,
  isTauri
} from "@/lib/db/sqlite";

export async function tableCount(table: string): Promise<number> {
  const db = await getDb();
  const rows = (await db.select<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table}`
  )) as Array<{ count: number }>;
  const value = rows?.[0]?.count;
  return typeof value === "number" ? value : 0;
}

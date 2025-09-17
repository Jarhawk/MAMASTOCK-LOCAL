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

export function insertReturningId(
  driver: "sqlite" | "postgres",
  table: string,
  cols: string[]
) {
  const placeholders = cols
    .map((_, index) => (driver === "postgres" ? `$${index + 1}` : `?`))
    .join(", ");
  const colList = cols.map((col) => `"${col}"`).join(", ");

  if (driver === "postgres") {
    return `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) RETURNING id;`;
  }

  return {
    insert: `INSERT INTO "${table}" (${colList}) VALUES (${placeholders});`,
    lastId: `SELECT last_insert_rowid() AS id;`
  };
}

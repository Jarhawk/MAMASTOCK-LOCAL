import { getDb, isTauri } from "@/lib/db/sql";

export { getDb };

export async function getMeta(key: string) {
  const db = await getDb();
  const row = await db.select<{value?: string;}[]>(
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
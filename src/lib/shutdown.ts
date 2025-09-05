import { getDb } from "./db";

export async function shutdown() {
  const db = await getDb();
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
}

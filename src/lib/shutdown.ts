import { getDb } from "./db";import { isTauri } from "@/lib/tauriEnv";

export async function shutdownDbSafely() {
  const db = await getDb();
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  await db.close();
}
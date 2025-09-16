import { getDb } from "@/lib/db/sql";
import { isTauri } from "@/lib/tauriEnv";

export async function shutdownDbSafely() {
  if (!isTauri()) {
    console.log("shutdownDbSafely: ignoré hors Tauri");
    return;
  }

  const db = await getDb();
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  if (typeof db.close === "function") {
    await db.close();
  }
}
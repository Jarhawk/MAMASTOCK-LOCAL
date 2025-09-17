import { getDb } from "@/lib/db/database";
import { isTauri } from "@/lib/tauriEnv";

export async function shutdownDbSafely() {
  if (!isTauri()) {
    console.log("shutdownDbSafely: ignoré hors Tauri");
    return;
  }

  const db = await getDb();
  if (typeof db.close === "function") {
    await db.close();
  }
}
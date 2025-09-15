import { isTauri, getDb } from "@/lib/db/sql";

let done = false;
export async function runSqlSelfTest() {
  if (done) return;
  done = true;
  if (!isTauri) {
    console.log("[SQL SelfTest] hors Tauri -> ok (skip)");
    return;
  }
  try {
    const db = await getDb();
    await db.select("SELECT 1 AS ok");
    console.info("[SQL SelfTest] SELECT ok");
    await db.execute("CREATE TABLE IF NOT EXISTS _ping (id INTEGER PRIMARY KEY, ts TEXT)");
    await db.execute("DELETE FROM _ping");
    await db.execute("INSERT INTO _ping(ts) VALUES (datetime('now'))");
    const r = await db.select("SELECT COUNT(*) AS c FROM _ping");
    console.info("[SQL SelfTest] write ok, rows:", r?.[0]?.c ?? 0);
  } catch (e: any) {
    console.error("[SQL SelfTest] ERROR:", e?.message || e);
  }
}

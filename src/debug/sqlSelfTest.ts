import { loadDb } from "@/lib/db";
import { isTauri } from "@/lib/tauriEnv";

let done = false;
export async function runSqlSelfTest() {
  if (done) return;
  done = true;
  if (!isTauri()) {
    console.log("[SQL SelfTest] hors Tauri -> ok (skip)");
    return;
  }
  try {
    const { db, cfg } = await loadDb();
    if (cfg.database.driver === "postgres") {
      await db.select("SELECT 1 AS ok");
      console.info("[SQL SelfTest] SELECT ok (postgres)");
      await db.execute(
        "CREATE TABLE IF NOT EXISTS _ping (id BIGSERIAL PRIMARY KEY, ts TIMESTAMPTZ NOT NULL DEFAULT now())"
      );
      await db.execute("TRUNCATE TABLE _ping;");
      await db.execute("INSERT INTO _ping(ts) VALUES (now())");
      const r = await db.select("SELECT COUNT(*) AS c FROM _ping");
      console.info("[SQL SelfTest] write ok (postgres), rows:", r?.[0]?.c ?? 0);
    } else {
      await db.select("SELECT 1 AS ok");
      console.info("[SQL SelfTest] SELECT ok (sqlite)");
      await db.execute("CREATE TABLE IF NOT EXISTS _ping (id INTEGER PRIMARY KEY, ts TEXT)");
      await db.execute("DELETE FROM _ping");
      await db.execute("INSERT INTO _ping(ts) VALUES (datetime('now'))");
      const r = await db.select("SELECT COUNT(*) AS c FROM _ping");
      console.info("[SQL SelfTest] write ok (sqlite), rows:", r?.[0]?.c ?? 0);
    }
  } catch (e: any) {
    console.error("[SQL SelfTest] ERROR:", e?.message || e);
  }
}

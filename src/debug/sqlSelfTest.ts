import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/tauriEnv";

let done = false;
export async function runSqlSelfTest() {
  if (done) return;
  done = true;
  if (!isTauri()) {
    console.log("[SQL SelfTest] hors Tauri -> ok (skip)");
    return;
  }
  try {
    const db = await getDb();
    await db.select("SELECT 1 AS ok");
    console.info("[SQL SelfTest] SELECT ok");
    const table = `_ping_${Math.random().toString(36).slice(2, 10)}`;
    await db.execute(
      `CREATE TEMP TABLE ${table} (id SERIAL PRIMARY KEY, ts TIMESTAMPTZ DEFAULT now())`
    );
    await db.execute(`INSERT INTO ${table}(ts) VALUES (now())`);
    const r = await db.select(`SELECT COUNT(*) AS c FROM ${table}`);
    console.info("[SQL SelfTest] write ok, rows:", r?.[0]?.c ?? 0);
  } catch (e: any) {
    console.error("[SQL SelfTest] ERROR:", e?.message || e);
  }
}

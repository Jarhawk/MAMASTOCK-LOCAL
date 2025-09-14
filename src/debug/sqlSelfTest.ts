import { isTauri } from "@/lib/db/sql";

export async function runSqlSelfTest() {
  if (!isTauri) {
    console.info("[SQL SelfTest] hors Tauri -> ok (skip)");
    return;
  }
  try {
    const Database = (await import("@tauri-apps/plugin-sql")).default;
    const db = await Database.load("sqlite:mamastock.db"); // nécessite sql:allow-load
    const rows = await db.select("SELECT 1 AS ok");
    console.info("[SQL SelfTest] OK, permissions actives:", rows);
  } catch (e:any) {
    console.error("[SQL SelfTest] ÉCHEC:", e?.message ?? e);
    console.error("-> Vérifie src-tauri/capabilities/sql.json et relance complètement Tauri.");
  }
}

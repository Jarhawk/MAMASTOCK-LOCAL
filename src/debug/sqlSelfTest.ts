import Database from "@tauri-apps/plugin-sql";

export async function runSqlSelfTest() {
  const inTauri = !!import.meta.env.TAURI_PLATFORM;
  if (!inTauri) {
    console.info("[SQL SelfTest] hors Tauri -> ok (skip)");
    return;
  }
  try {
    const db = await Database.load("sqlite:mamastock.db"); // nécessite sql:allow-load
    const rows = await db.select("SELECT 1 AS ok");
    console.info("[SQL SelfTest] OK, permissions actives:", rows);
  } catch (e:any) {
    console.error("[SQL SelfTest] ÉCHEC:", e?.message ?? e);
    console.error("-> Vérifie src-tauri/capabilities/sql.json et relance complètement Tauri.");
  }
}

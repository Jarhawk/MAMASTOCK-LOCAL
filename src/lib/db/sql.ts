// src/lib/db/sql.ts
import { isTauri, requireTauri } from "../runtime";
import { homeDir, join } from "@tauri-apps/api/path";

// Cache db unique
let _db: any | null = null;

export { isTauri, requireTauri }; // <-- ré-export pour les appels existants

export async function getDb() {
  requireTauri("Tauri required: run via `npx tauri dev` to access SQLite");

  if (_db) return _db;

  // v2: import par défaut + import dynamique
  const { default: Database } = await import("@tauri-apps/plugin-sql");

  try {
    // fichier dans AppData/Roaming/MamaStock/data/mamastock.db (côté plugin)
    const base = await homeDir();
    const abs  = await join(base, "MamaStock", "data", "mamastock.db");
    _db = await Database.load(`sqlite:${abs}`);
    return _db;
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg.includes("sql.load not allowed")) {
      throw new Error(
        "sql.load not allowed – ajoute `sql:allow-load` dans src-tauri/capabilities/sql.json puis relance Tauri"
      );
    }
    throw e;
  }
}

export async function closeDb() {
  try {
    if (_db?.close) await _db.close();
  } finally {
    _db = null;
  }
}

// --- ident safe (pas d'injection d'identifiants) ---
function _assertIdent(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

/** Compte les lignes d'une table */
export async function tableCount(table: string): Promise<number> {
  const db = await getDb();
  const t = _assertIdent(table);
  const rows = await db.select(`SELECT COUNT(*) AS c FROM ${t}`);
  const n = rows?.[0]?.c ?? 0;
  return Number(n);
}

/** Compte plusieurs tables d'un coup */
export async function tableCounts(tables: string[]): Promise<Record<string, number>> {
  const db = await getDb();
  const out: Record<string, number> = {};
  for (const tname of tables) {
    const t = _assertIdent(tname);
    const r = await db.select(`SELECT COUNT(*) AS c FROM ${t}`);
    out[tname] = Number(r?.[0]?.c ?? 0);
  }
  return out;
}

/** Récupère les KPI depuis la vue si elle existe */
export async function getDashboardKPI(): Promise<any[]> {
  const db = await getDb();
  try {
    return await db.select(`SELECT * FROM v_dashboard_kpi`);
  } catch {
    return [];
  }
}


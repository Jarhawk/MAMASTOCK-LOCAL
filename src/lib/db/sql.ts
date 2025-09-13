// src/lib/db/sql.ts
import Database from "@tauri-apps/plugin-sql"; // ⚠️ default export
import { appDataDir, join } from "@tauri-apps/api/path";

/** Détection runtime fiable (marche en dev via TAURI_DEV_URL dans la fenêtre Tauri) */
export const isTauri: boolean = (() => {
  try {
    return typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
  } catch {
    return false;
  }
})();

export function requireTauri() {
  if (!isTauri) throw new Error("Tauri requis: lance via `npx tauri dev`.");
}

let _dbPromise: Promise<any> | null = null;
let _db: any | null = null;

/** Ouvre (ou réutilise) la connexion SQLite située dans AppData\Roaming\com.mamastock.local\MamaStock\mamastock.db */
export async function getDb() {
  requireTauri();
  if (_db) return _db;
  if (!_dbPromise) {
    _dbPromise = (async () => {
      const base = await appDataDir();
      const file = await join(base, "MamaStock", "mamastock.db");
      const db = await Database.load(`sqlite:${file}`); // nécessite sql:allow-load
      _db = db;
      return db;
    })();
  }
  return _dbPromise;
}

/** Ferme la connexion si possible et purge le cache (best-effort) */
export async function closeDb() {
  try {
    if (_db && typeof _db.close === "function") {
      await _db.close();
    }
  } catch {
    // certains backends n'exposent pas close(); on ignore
  } finally {
    _db = null;
    _dbPromise = null;
  }
}

// ---------- Helpers Dashboard / util ----------

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
  return Number(rows?.[0]?.c ?? 0);
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

/** KPI depuis la vue (si existante) */
export async function getDashboardKPI(): Promise<any[]> {
  const db = await getDb();
  try {
    return await db.select("SELECT * FROM v_dashboard_kpi");
  } catch {
    return [];
  }
}

export default {
  isTauri,
  requireTauri,
  getDb,
  closeDb,
  tableCount,
  tableCounts,
  getDashboardKPI,
};

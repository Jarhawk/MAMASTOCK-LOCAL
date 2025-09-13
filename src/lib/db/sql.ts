// src/lib/db/sql.ts
import { isTauri, requireTauri } from "../runtime";

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
    _db = await Database.load("sqlite:mamastock.db");
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


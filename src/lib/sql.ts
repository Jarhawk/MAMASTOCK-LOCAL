// src/lib/sql.ts
import { isTauri, requireTauri } from "./runtime";

// Cache DB pour éviter les re-load
let _db: any | null = null;

export async function getDb() {
  requireTauri("Tauri required: run via `npx tauri dev` to access SQLite");

  if (_db) return _db;

  // ⚠️ Import dynamique et import par défaut (v2)
  const { default: Database } = await import("@tauri-apps/plugin-sql");

  try {
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


// src/lib/sql.ts
import { Database } from "@tauri-apps/plugin-sql";
import { isTauri, requireTauri } from "./runtime";

export async function getDb() {
  requireTauri("Tauri required: run via `npx tauri dev` to access SQLite");
  try {
    // Chemin logique géré par tauri-plugin-sql (dossier app)
    return await Database.load("sqlite:mamastock.db");
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

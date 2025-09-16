// src/lib/db/sql.ts
import Database from "@tauri-apps/plugin-sql";
import { homeDir, join } from "@tauri-apps/api/path";
import { isTauri } from "@/lib/tauriEnv";

let _db: any | null = null;

async function dbFsPath(): Promise<string> {
  // Chemin aligné avec scripts Node (move-db-once/sqlite-apply):
  // %USERPROFILE%/MamaStock/data/mamastock.db
  const h = await homeDir();
  return await join(h, "MamaStock", "data", "mamastock.db");
}

function toSqliteUrl(p: string): string {
  return "sqlite:///" + p.replace(/\\/g, "/");
}

export async function getDb() {
  if (!isTauri()) {
    throw new Error("Vous êtes dans le navigateur. Ouvrez la fenêtre Tauri pour SQLite.");
  }
  if (_db) return _db;
  const fsPath = await dbFsPath();
  const url = toSqliteUrl(fsPath);
  _db = await Database.load(url);
  return _db!;
}

export async function closeDb() {
  try {
    if (_db && typeof _db.close === "function") await _db.close();
  } catch (e) {
    console.warn("[closeDb] ignoré:", e);
  } finally {
    _db = null;
  }
}

// ==== Stubs de compat pour anciens imports (Onboarding, etc.) ====
// Évitent les erreurs "does not provide an export named ..."
export async function locateDb(): Promise<string> {
  const p = await dbFsPath();
  return p;
}

export async function openDb() {
  // alias de compat
  return await getDb();
}

export async function ensureSeeds(): Promise<void> {
  // no-op côté frontend : les seeds se font via scripts Node (db:apply / 002_seed.sql)
  return;
}

export async function getMigrationsState(): Promise<Array<{ name: string; applied: boolean }>> {
  // Si besoin, à implémenter via SELECT sur __migrations__ ; on renvoie vide par défaut
  return [];
}

export { isTauri };

/* src/lib/db/sql.ts */
import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { isTauri } from "@/lib/runtime/isTauri";

let _db: any | null = null;
let _opening: Promise<any> | null = null;

async function dbPath(): Promise<string> {
  // On stocke la DB dans l’AppData du profil Tauri, sous MamaStock/data/mamastock.db
  const base = await appDataDir();
  // on tolère l’absence de mkdir ici : la base est créée par SQLite si le dossier existe déjà
  // Si besoin tu peux sécuriser avec plugin-fs mkdir récursif.
  const dir = await join(base, "MamaStock", "data");
  const file = await join(dir, "mamastock.db");
  return file;
}

export async function getDb() {
  if (!isTauri) {
    throw new Error("Tauri requis : ouvre l’app via la fenêtre Tauri (pas le navigateur) pour activer SQLite.");
  }
  if (_db) return _db;
  if (_opening) return _opening;

  _opening = (async () => {
    const file = await dbPath();
    try {
      // NOTE: v2 -> default import + Database.load("sqlite:<abs path>")
      const db = await Database.load(`sqlite:${file}`);
      _db = db;
      return db;
    } catch (e: any) {
      // Cas de droits manquants (capabilities)
      const msg = String(e?.message || e);
      if (/sql\.load not allowed/i.test(msg)) {
        console.error(
          "[SQL] Permission manquante: sql:allow-load. " +
          "Vérifie src-tauri/capabilities/sql.json (doit contenir sql:allow-load, sql:allow-select, sql:allow-execute, sql:allow-close)."
        );
      }
      throw e;
    } finally {
      _opening = null;
    }
  })();

  return _opening;
}

export async function closeDb() {
  try { await _db?.close?.(); } catch {}
  _db = null;
}

export async function sqlSelfTest() {
  if (!isTauri) {
    console.info("[SQL SelfTest] hors Tauri -> ok (skip)");
    return { ok: true, skipped: true };
  }
  const db = await getDb();
  const rows = await db.select("SELECT 1 as v");
  return { ok: rows?.[0]?.v === 1, rows };
}

export { isTauri };

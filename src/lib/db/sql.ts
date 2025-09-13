import Database from "@tauri-apps/plugin-sql";
import { homeDir, appDataDir, join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { isTauri } from "@/lib/runtime";

export { isTauri };

let _db: any | null = null;
let _dbPath: string | null = null;

/**
 * Locate the SQLite database file on disk. Looks under home and appData dirs.
 * Returns the first existing path or null if none found.
 */
export async function locateDb(): Promise<string | null> {
  if (!isTauri) return null;
  const h = await homeDir();
  const candidate1 = await join(h, "MamaStock", "data", "mamastock.db");
  if (await exists(candidate1)) return candidate1;
  const a = await appDataDir();
  const candidate2 = await join(a, "MamaStock", "mamastock.db");
  if (await exists(candidate2)) return candidate2;
  return null;
}

/**
 * Open the SQLite database using tauri-plugin-sql. Handles Windows path quirks.
 */
export async function openDb() {
  if (!isTauri) throw new Error("Tauri required");
  if (_db) return _db;
  let p = await locateDb();
  if (!p) {
    const h = await homeDir();
    p = await join(h, "MamaStock", "data", "mamastock.db");
  }
  try {
    _db = await Database.load(`sqlite:${p}`);
    _dbPath = p;
    return _db;
  } catch (e) {
    const norm = p.replace(/\\/g, "/");
    _db = await Database.load(`sqlite:/${norm}`);
    _dbPath = p;
    return _db;
  }
}

export async function getDb() {
  return openDb();
}

export async function tableCount(name: string): Promise<number> {
  const db = await openDb();
  const rows = await db.select(`SELECT COUNT(*) AS n FROM ${name}`);
  return rows[0]?.n ?? 0;
}

export async function ensureSeeds() {
  const db = await openDb();
  const result = { unites: 0, familles: 0, sous_familles: 0 };

  if (await tableCount("unites") === 0) {
    const seeds = [
      ["PIECE", "pc"],
      ["KILOGRAMME", "kg"],
      ["LITRE", "l"],
    ];
    for (const [nom, abbr] of seeds) {
      const r = await db.execute(
        "INSERT OR IGNORE INTO unites(nom, abbr) VALUES (?, ?)",
        [nom, abbr]
      );
      result.unites += r.rowsAffected ?? 0;
    }
  }

  if (await tableCount("familles") === 0) {
    const r = await db.execute(
      "INSERT OR IGNORE INTO familles(nom) VALUES (?)",
      ["G\u00e9n\u00e9rique"]
    );
    result.familles += r.rowsAffected ?? 0;
  }

  if (await tableCount("sous_familles") === 0) {
    const fidRow = await db.select(
      "SELECT id FROM familles WHERE nom = ?",
      ["G\u00e9n\u00e9rique"]
    );
    const fid = fidRow[0]?.id;
    if (fid != null) {
      const r = await db.execute(
        "INSERT OR IGNORE INTO sous_familles(famille_id, nom) VALUES (?, ?)",
        [fid, "Par d\u00e9faut"]
      );
      result.sous_familles += r.rowsAffected ?? 0;
    }
  }

  return result;
}

export async function getMigrationsState() {
  const db = await openDb();
  const table = await db.select(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='__migrations__'"
  );
  const migrationsTable = table.length > 0;
  let rows = 0;
  if (migrationsTable) {
    const r = await db.select("SELECT COUNT(*) AS n FROM __migrations__");
    rows = r[0]?.n ?? 0;
  }
  const ver = await db.select("PRAGMA user_version");
  const userVersion = ver[0]?.user_version ?? 0;
  return { migrationsTable, rows, userVersion };
}

export function dbPath() {
  return _dbPath;
}

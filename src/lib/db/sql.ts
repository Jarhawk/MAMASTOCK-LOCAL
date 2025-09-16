// src/lib/db/sql.ts
import Database from "@tauri-apps/plugin-sql";
import schemaSQL from "@/../db/sqlite/001_schema.sql?raw";
import { isTauri } from "@/lib/tauriEnv";

export type SqliteDatabase = {
  select<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<unknown>;
  close?: () => Promise<void>;
};

let tauriDb: SqliteDatabase | null = null;
let devStub: SqliteDatabase | null = null;
let schemaInitPromise: Promise<void> | null = null;

function ensureDevStub(): SqliteDatabase {
  if (devStub) return devStub;
  let notified = false;
  const notify = () => {
    if (!notified) {
      console.info(
        "[sqlite] Mode navigateur détecté : les requêtes SQLite renvoient des résultats vides (DEV)."
      );
      notified = true;
    }
  };
  devStub = {
    async select() {
      notify();
      return [];
    },
    async execute() {
      notify();
    },
    async close() {
      /* noop */
    }
  };
  return devStub;
}

async function ensureDataDir() {
  const { appDataDir, join } = await import("@tauri-apps/api/path");
  const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
  const base = await appDataDir();
  const appDir = await join(base, "MamaStock");
  if (!(await exists(appDir))) await mkdir(appDir, { recursive: true });
  const dataDir = await join(appDir, "data");
  if (!(await exists(dataDir))) await mkdir(dataDir, { recursive: true });
  const file = await join(dataDir, "mamastock.db");
  const normalized = file.replace(/\\/g, "/");
  return { file, url: `sqlite:${normalized}` };
}

async function initDbIfNeeded(db: SqliteDatabase) {
  if (schemaInitPromise) {
    await schemaInitPromise;
    return;
  }

  schemaInitPromise = (async () => {
    try {
      const rows = await db.select<{ name: string }[]>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='meta' LIMIT 1"
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return;
      }
    } catch (err) {
      console.warn("[sqlite] Impossible de vérifier la présence du schéma initial:", err);
    }

    try {
      await db.execute("BEGIN;");
      await db.execute(schemaSQL);
      await db.execute("COMMIT;");
      console.info("[sqlite] Schéma 001_schema.sql appliqué");
    } catch (err) {
      try {
        await db.execute("ROLLBACK;");
      } catch {}
      console.error("[sqlite] Erreur lors de l'initialisation de la base SQLite:", err);
    }
  })();

  await schemaInitPromise;
}

export async function getDb(): Promise<SqliteDatabase> {
  if (!isTauri()) {
    return ensureDevStub();
  }

  if (tauriDb) return tauriDb;

  try {
    const { url } = await ensureDataDir();
    const db = await Database.load(url);
    await initDbIfNeeded(db);
    tauriDb = db;
    return tauriDb;
  } catch (err) {
    console.error("[sqlite] Ouverture de la base locale impossible, fallback stub:", err);
    return ensureDevStub();
  }
}

export async function closeDb() {
  try {
    if (tauriDb && typeof tauriDb.close === "function") {
      await tauriDb.close();
    }
  } catch (e) {
    console.warn("[closeDb] Ignoré:", e);
  } finally {
    tauriDb = null;
    schemaInitPromise = null;
    devStub = null;
  }
}

export async function locateDb(): Promise<string> {
  if (!isTauri()) {
    console.warn("[sqlite] locateDb appelé hors contexte Tauri (DEV navigateur)");
    return "";
  }
  const { file } = await ensureDataDir();
  return file;
}

export async function openDb() {
  return await getDb();
}

export async function ensureSeeds(): Promise<void> {
  return;
}

export async function getMigrationsState(): Promise<Array<{ name: string; applied: boolean }>> {
  return [];
}

export { isTauri };

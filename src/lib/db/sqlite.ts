import Database from "@tauri-apps/plugin-sql";
import schemaSQL from "@/../db/sqlite/001_schema.sql?raw";
import { devFlags } from "@/lib/devFlags";
import { getDbPath } from "@/lib/paths";

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
      console.info("[sqlite] Browser DEV — returning empty results");
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
      return undefined;
    },
    async close() {
      notify();
    }
  };
  return devStub;
}

async function createTauriDb(url: string): Promise<SqliteDatabase> {
  const DatabaseAny = Database as any;
  if (typeof DatabaseAny?.load !== "function") {
    throw new Error("[@tauri-apps/plugin-sql] load() missing");
  }
  return DatabaseAny.load(url);
}

// CODEREVIEW: centralize sqlite data location under AppData helper
async function resolveDbPath() {
  const file = await getDbPath();
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
  if (!devFlags.isTauri) {
    return ensureDevStub();
  }

  if (tauriDb) {
    return tauriDb;
  }

  try {
    const { url } = await resolveDbPath();
    const db = (await createTauriDb(url)) as SqliteDatabase;
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
  } catch (err) {
    console.warn("[sqlite] Fermeture de la base ignorée:", err);
  } finally {
    tauriDb = null;
    schemaInitPromise = null;
    devStub = null;
  }
}

export async function locateDb(): Promise<string> {
  if (!devFlags.isTauri) {
    console.info("[sqlite] locateDb appelé hors contexte Tauri (mode navigateur)");
    return "";
  }
  return getDbPath();
}

export async function openDb() {
  return getDb();
}

export async function ensureSeeds(): Promise<void> {
  return;
}

export async function getMigrationsState(): Promise<Array<{ name: string; applied: boolean }>> {
  return [];
}

export const isTauri = devFlags.isTauri;

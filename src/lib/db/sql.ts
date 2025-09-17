import Database from "@tauri-apps/plugin-sql";

import { getDbConfig, getPostgresUrl } from "@/lib/appConfig";
import { getPg } from "@/lib/db/pg";
import { isTauri } from "@/lib/tauriEnv";
import { log } from "@/tauriLog";

export type SqlDatabase = {
  select<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<unknown>;
  close?: () => Promise<void>;
};

export type SqliteDatabase = SqlDatabase;

let tauriDb: SqlDatabase | null = null;
let devStub: SqlDatabase | null = null;

function ensureDevStub(): SqlDatabase {
  if (devStub) return devStub;
  let notified = false;
  const notify = () => {
    if (!notified) {
      console.info("[sql] Plugin SQL indisponible — stub en lecture seule");
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
    },
  };
  return devStub;
}

async function createTauriDb(url: string): Promise<SqlDatabase> {
  const DatabaseAny = Database as any;
  if (typeof DatabaseAny?.load !== "function") {
    throw new Error("[@tauri-apps/plugin-sql] load() manquant");
  }
  return DatabaseAny.load(url);
}

async function openSqliteIfConfigured(): Promise<SqlDatabase | null> {
  const cfg = await getDbConfig();
  if (!cfg) return null;
  const type = cfg.type.toLowerCase();
  if (type === "sqlite" || cfg.url.toLowerCase().startsWith("sqlite:")) {
    const db = await createTauriDb(cfg.url);
    log.info("[sql] Ouverture SQLite (mode développement)");
    return db as SqlDatabase;
  }
  return null;
}

export async function getDb(): Promise<SqlDatabase> {
  if (!isTauri()) {
    return ensureDevStub();
  }

  if (tauriDb) {
    return tauriDb;
  }

  if (import.meta.env.PROD) {
    const pg = (await getPg()) as SqlDatabase;
    tauriDb = pg;
    return pg;
  }

  const sqliteDb = await openSqliteIfConfigured();
  if (sqliteDb) {
    tauriDb = sqliteDb;
    return sqliteDb;
  }

  const pgUrl = await getPostgresUrl();
  if (pgUrl) {
    const pg = (await getPg()) as SqlDatabase;
    tauriDb = pg;
    return pg;
  }

  throw new Error("Aucune base de données configurée");
}

export async function openDb() {
  return getDb();
}

export async function closeDb() {
  try {
    if (tauriDb && typeof tauriDb.close === "function") {
      await tauriDb.close();
    }
  } catch (err) {
    console.warn("[sql] Fermeture ignorée:", err);
  } finally {
    tauriDb = null;
    devStub = null;
  }
}

export async function locateDb(): Promise<string> {
  if (!isTauri()) {
    console.info("[sql] locateDb hors Tauri");
    return "";
  }
  const pgUrl = await getPostgresUrl();
  if (pgUrl) return pgUrl;
  const cfg = await getDbConfig();
  return cfg?.url ?? "";
}

export async function ensureSeeds(): Promise<void> {
  return;
}

export async function getMigrationsState(): Promise<
  Array<{ name: string; applied: boolean }>
> {
  return [];
}

export const isTauriRuntime = isTauri;

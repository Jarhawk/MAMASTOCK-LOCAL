import Database from "@tauri-apps/plugin-sql";

import { loadConfig } from "@/local/config";
import { isTauri } from "@/lib/tauriEnv";

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

export async function getDb(): Promise<SqlDatabase> {
  if (!isTauri()) {
    return ensureDevStub();
  }

  if (tauriDb) {
    return tauriDb;
  }

  const { dbUrl } = await loadConfig();
  if (!dbUrl) {
    throw new Error("Aucune URL PostgreSQL configurée");
  }
  const db = (await createTauriDb(dbUrl)) as SqlDatabase;
  tauriDb = db;
  return tauriDb;
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
  const { dbUrl } = await loadConfig();
  return dbUrl;
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

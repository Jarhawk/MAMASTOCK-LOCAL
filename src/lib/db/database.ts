import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";

import { getDbPath } from "@/lib/paths";
import { isTauri } from "@/lib/tauriEnv";
import { log } from "@/tauriLog";

export type SqlDatabase = {
  select<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<unknown>;
  close?: () => Promise<void>;
};

const MEMORY_DRIVER_SYMBOL = Symbol.for("mamastock.db.memoryDriver");

type MemoryDriverDatabase = SqlDatabase & {
  [MEMORY_DRIVER_SYMBOL]?: true;
};

export type SqliteDatabase = SqlDatabase;

let tauriDb: SqlDatabase | null = null;
let devStub: MemoryDriverDatabase | null = null;

function maskUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}

function isSqliteUrl(raw: string): boolean {
  return raw.trim().toLowerCase().startsWith("sqlite:");
}

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
    [MEMORY_DRIVER_SYMBOL]: true,
  };
  return devStub;
}

export function isMemoryDriver(db: SqlDatabase | null | undefined): db is MemoryDriverDatabase {
  return Boolean((db as MemoryDriverDatabase)?.[MEMORY_DRIVER_SYMBOL]);
}

export function isMemoryDriverActive(): boolean {
  return isMemoryDriver(devStub);
}

type ResolvedDb = {
  url: string;
  kind: "sqlite";
};

async function resolveDbUrl(opts: { silent?: boolean } = {}): Promise<ResolvedDb> {
  const { silent = false } = opts;
  if (!isTauri()) {
    return { url: "sqlite:mamastock.db", kind: "sqlite" };
  }

  const fromRust = await invoke<string | null>("get_db_url").catch(() => null);
  if (fromRust && fromRust.trim().length > 0) {
    const trimmed = fromRust.trim();
    if (isSqliteUrl(trimmed)) {
      if (!silent) {
        log.info(`[db] Utilisation de SQLite (${maskUrl(trimmed)}).`);
      }
      return { url: trimmed, kind: "sqlite" };
    }
    if (!silent) {
      log.warn(`[db] Chaîne non supportée ignorée (${maskUrl(trimmed)}).`);
    }
  }

  let fallback = "sqlite:mamastock.db";
  try {
    const path = await getDbPath();
    const normalizedPath = path?.trim();
    if (normalizedPath) {
      fallback = `sqlite:${normalizedPath}`;
    }
  } catch (err) {
    if (!silent) {
      log.warn("[db] Impossible de déterminer le chemin SQLite local", err);
    }
  }
  if (!silent) {
    log.info(`[db] SQLite local (${maskUrl(fallback)}).`);
  }
  return { url: fallback, kind: "sqlite" };
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
  const resolved = await resolveDbUrl();
  tauriDb = await createTauriDb(resolved.url);
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
  const resolved = await resolveDbUrl({ silent: true });
  return resolved.url;
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

export async function pingDb(): Promise<boolean> {
  const db = await getDb();
  try {
    const rows = await db.select("SELECT 1 as ok");
    return Array.isArray(rows);
  } catch {
    return false;
  }
}


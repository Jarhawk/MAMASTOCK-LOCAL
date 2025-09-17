import Database from "@tauri-apps/plugin-sql";
import { invoke } from "@tauri-apps/api/core";

import { normalizePgUrl } from "@/lib/db/pg";
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

type NormalizedInfo = {
  url: string;
  removedChannelBinding: boolean;
  ensuredSsl: boolean;
};

function ensurePgUrl(raw: string): NormalizedInfo {
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().startsWith("postgres")) {
    return { url: trimmed, removedChannelBinding: false, ensuredSsl: false };
  }
  const normalized = normalizePgUrl(trimmed);
  let finalUrl = normalized.url;
  let ensuredSsl = false;
  if (!normalized.hasSslRequire) {
    try {
      const parsed = new URL(finalUrl);
      const current = (parsed.searchParams.get("sslmode") ?? "").toLowerCase();
      if (current !== "require") {
        parsed.searchParams.set("sslmode", "require");
        finalUrl = parsed.toString();
        ensuredSsl = true;
      }
    } catch {
      const hasQuery = finalUrl.includes("?");
      const needsAmpersand = hasQuery && !finalUrl.endsWith("?") && !finalUrl.endsWith("&");
      const separator = hasQuery ? (needsAmpersand ? "&" : "") : "?";
      finalUrl = `${finalUrl}${separator}sslmode=require`;
      ensuredSsl = true;
    }
  }
  if (normalized.removedChannelBinding) {
    log.warn(`[db] Paramètre channel_binding=require ignoré (${maskUrl(finalUrl)}).`);
  }
  if (ensuredSsl && !normalized.hasSslRequire) {
    log.warn(`[db] sslmode=require ajouté automatiquement (${maskUrl(finalUrl)}).`);
  }
  return {
    url: finalUrl,
    removedChannelBinding: normalized.removedChannelBinding,
    ensuredSsl,
  };
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
  };
  return devStub;
}

type ResolvedDb = {
  url: string;
  kind: "postgres" | "sqlite";
};

async function resolveDbUrl(opts: { silent?: boolean } = {}): Promise<ResolvedDb> {
  const { silent = false } = opts;
  if (!isTauri()) {
    return { url: "sqlite:mamastock.db", kind: "sqlite" };
  }

  const fromRust = await invoke<string | null>("get_db_url").catch(() => null);
  if (fromRust && fromRust.trim().length > 0) {
    const normalized = ensurePgUrl(fromRust);
    if (!silent) {
      log.info(`[db] Utilisation de PostgreSQL (${maskUrl(normalized.url)}).`);
    }
    return { url: normalized.url, kind: "postgres" };
  }

  if (!silent) {
    log.info("[db] Aucun DSN PostgreSQL détecté — bascule sur SQLite local.");
  }
  return { url: "sqlite:mamastock.db", kind: "sqlite" };
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
    const rows = await db.select("SELECT NOW() as now");
    return Array.isArray(rows);
  } catch {
    try {
      const rows = await db.select("SELECT datetime('now') as now");
      return Array.isArray(rows);
    } catch {
      return false;
    }
  }
}


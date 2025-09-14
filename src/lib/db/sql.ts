// src/lib/db/sql.ts
/// <reference types="vite/client" />

import type { Database } from "@tauri-apps/plugin-sql";

export const isTauri = !!import.meta.env.TAURI_PLATFORM;
export { isTauri as IS_TAURI };

if (typeof window !== "undefined" && !isTauri) {
  console.warn(
    "Vous êtes dans le navigateur. Ouvrez l’app dans la fenêtre Tauri pour activer SQLite."
  );
}

const forceTauri = (() => {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("forceTauri") === "1";
  } catch {
    return false;
  }
})();

const hasTauriEnv =
  (typeof window !== "undefined" &&
    ((window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__)) ||
  isTauri;

let _db: Database | null = null;
let _loading: Promise<Database> | null = null;

export async function locateDb(): Promise<string> {
  if (!isTauri) throw new Error("Tauri required");
  const { appDataDir, join } = await import("@tauri-apps/api/path");
  const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
  const base = await appDataDir();
  const dir = await join(base, "MamaStock");
  if (!(await exists(dir))) {
    await mkdir(dir, { recursive: true });
  }
  return await join(dir, "mamastock.db");
}

export async function openDb(): Promise<Database> {
  if (!isTauri) throw new Error("Tauri required");
  if (_db) return _db;
  if (_loading) return _loading;
  const path = await locateDb();
  const { Database } = await import("@tauri-apps/plugin-sql");
  _loading = Database.load(`sqlite:${path}`)
    .then((db) => {
      _db = db;
      return db;
    })
    .finally(() => {
      _loading = null;
    });
  return _loading;
}

export async function getDb() {
  if (_db) return _db;
  if (_loading) return _loading;

  if (!hasTauriEnv) {
    if (forceTauri) {
      console.warn("[sql] SQL désactivé (forceTauri)");
      const mock = {
        load: async () => Promise.reject(new Error("SQL désactivé (forceTauri)")),
        execute: async () => Promise.reject(new Error("SQL désactivé (forceTauri)")),
        select: async () => Promise.reject(new Error("SQL désactivé (forceTauri)")),
        close: async () => Promise.reject(new Error("SQL désactivé (forceTauri)")),
      } as unknown as Database;
      _db = mock;
      return mock;
    }
    throw new Error("Tauri requis: lance via `npx tauri dev`");
  }

  return openDb();
}

export async function ensureSeeds() {
  const db = await openDb();
  await db.execute(
    "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)"
  );
  await db.execute(
    "INSERT OR IGNORE INTO meta(key,value) VALUES ('installed','1')"
  );
}

export async function getMigrationsState(): Promise<
  { id: string; applied_at: string }[]
> {
  const db = await openDb();
  await db.execute(
    "CREATE TABLE IF NOT EXISTS __migrations__(id TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)"
  );
  const rows = await db.select(
    "SELECT id, applied_at FROM __migrations__ ORDER BY applied_at"
  );
  return rows as { id: string; applied_at: string }[];
}

export async function tableCount(name: string): Promise<number> {
  const db = await openDb();
  const table = name.replace(/"/g, '""');
  const rows = await db.select(
    `SELECT COUNT(*) as c FROM "${table}"`
  );
  return (rows as any)?.[0]?.c ?? 0;
}

export async function closeDb() {
  if (!_db) return;
  try {
    await _db.close();
  } finally {
    _db = null;
  }
}

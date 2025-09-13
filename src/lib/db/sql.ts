// src/lib/db/sql.ts
/// <reference types="vite/client" />

import Database from "@tauri-apps/plugin-sql";

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
  !!import.meta.env?.TAURI_PLATFORM;

export const isTauri = !!(hasTauriEnv || forceTauri);
export { isTauri as IS_TAURI };

let _db: any | null = null;
let _loading: Promise<any> | null = null;

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
      };
      _db = mock;
      return mock;
    }
    throw new Error("Tauri requis: lance via `npx tauri dev`");
  }

  _loading = Database.load("sqlite:mamastock.db")
    .then((db) => {
      _db = db;
      return db;
    })
    .finally(() => {
      _loading = null;
    });

  return _loading;
}

export async function tableCount(name: string): Promise<number> {
  const db = await getDb();
  const rows = await db.select(`SELECT COUNT(*) as c FROM ${name}`);
  return rows?.[0]?.c ?? 0;
}

export async function closeDb() {
  if (!_db) return;
  try {
    await _db.close?.();
  } catch {}
  _db = null;
}

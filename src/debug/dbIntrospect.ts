// src/debug/dbIntrospect.ts
import { appDataDir, join } from "@tauri-apps/api/path";
import Database from "@tauri-apps/plugin-sql";
import schemaSQL from "@/../db/sqlite/001_schema.sql?raw";

async function dbUrl() {
  const base = await appDataDir();
  const dir  = await join(base, "MamaStock", "data");
  const file = await join(dir, "mamastock.db");
  return { file, url: "sqlite:" + file };
}

async function openDb() {
  const { url } = await dbUrl();
  return await Database.load(url);
}

async function listTables() {
  const db = await openDb();
  const rows = await db.select("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY type, name");
  return rows;
}

async function ensureCoreSchema() {
  const db = await openDb();
  // Exécute 001_schema.sql tel quel
  await db.execute("BEGIN;");
  try {
    await db.execute(schemaSQL);
    await db.execute("COMMIT;");
  } catch (e) {
    await db.execute("ROLLBACK;");
    throw e;
  }
}

async function info() {
  const { file, url } = await dbUrl();
  const db = await openDb();
  const ver = await db.select("PRAGMA user_version;");
  const tables = await listTables();
  console.info("[DB] file:", file);
  console.info("[DB] url :", url);
  console.info("[DB] user_version:", ver);
  console.table(tables);
  return { file, url, ver, tables };
}

// Expose en global pour DevTools
declare global {
  interface Window {
    mamaDbInfo?: () => Promise<any>;
    mamaDbEnsureSchema?: () => Promise<void>;
  }
}
window.mamaDbInfo = info;
window.mamaDbEnsureSchema = ensureCoreSchema;

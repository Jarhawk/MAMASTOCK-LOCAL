// src/debug/dbIntrospect.ts
import Database from "@tauri-apps/plugin-sql";

import { loadConfig } from "@/local/config";

async function dbUrl() {
  const { dbUrl } = await loadConfig();
  if (!dbUrl) {
    throw new Error("Aucune URL PostgreSQL configurée");
  }
  return dbUrl;
}

async function openDb() {
  const url = await dbUrl();
  return await Database.load(url);
}

async function listTables() {
  const db = await openDb();
  const rows = await db.select(
    "SELECT table_name AS name, table_type AS type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_type, table_name"
  );
  return rows;
}

async function ensureCoreSchema() {
  console.warn("[db] ensureCoreSchema() non supporté avec PostgreSQL");
}

async function info() {
  const url = await dbUrl();
  const db = await openDb();
  const ver = await db.select("SELECT version() as version");
  const tables = await listTables();
  console.info("[DB] url :", url);
  console.info("[DB] version:", ver?.[0]?.version);
  console.table(tables);
  return { url, ver, tables };
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

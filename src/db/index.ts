/// <reference types="vite/client" />
import { getDb } from "@/lib/db/sql";

export async function openDb() {
  return await getDb();
}

/** Crée les tables minimales si absentes */
export async function initSchema() {
  const db = await openDb();
  await db.execute(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      mama_id TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      qty INTEGER NOT NULL,            -- +entrée / -sortie
      reason TEXT NOT NULL,            -- "init","purchase","sale","adjust"
      meta JSON,
      created_at TEXT NOT NULL,
      FOREIGN KEY(item_id) REFERENCES items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
    CREATE INDEX IF NOT EXISTS idx_mov_item ON stock_movements(item_id);
    CREATE INDEX IF NOT EXISTS idx_mov_created ON stock_movements(created_at);
  `);
  return db;
}

export async function sumStock(itemId: string): Promise<number> {
  const db = await openDb();
  const rows = await db.select("SELECT COALESCE(SUM(qty),0) AS s FROM stock_movements WHERE item_id = $1", [itemId]);
  return Number(rows?.[0]?.s ?? 0);
}


/// <reference types="vite/client" />
import { getDb } from "@/lib/db/database";

export async function openDb() {
  return await getDb();
}

/** Crée les tables minimales si absentes */
export async function initSchema() {
  const db = await openDb();
  return db;
}

export async function sumStock(itemId: string): Promise<number> {
  const db = await openDb();
  const rows = await db.select<{ s: number }>(
    "SELECT COALESCE(SUM(qty),0) AS s FROM stock_movements WHERE item_id = $1",
    [itemId]
  );
  return Number(rows?.[0]?.s ?? 0);
}

/// <reference types="vite/client" />
import { getDb, isMemoryDriver } from "@/lib/db/database";

const SUM_STOCK_SQL =
  "SELECT COALESCE(SUM(qty),0) AS s FROM stock_movements WHERE item_id = $1";

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
  const rows = await db.select<{ s: number | string | null }>(SUM_STOCK_SQL, [
    itemId,
  ]);
  return Number(rows?.[0]?.s ?? 0);
}

export async function sumStockForItems(
  itemIds: string[],
): Promise<Record<string, number>> {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return {};
  }

  const uniqueIds = Array.from(
    new Set(
      itemIds.filter((id): id is string => typeof id === "string" && id.length),
    ),
  );

  if (uniqueIds.length === 0) {
    return {};
  }

  const db = await openDb();

  if (isMemoryDriver(db)) {
    const fallback: Record<string, number> = {};
    for (const id of uniqueIds) {
      const rows = await db.select<{ s: number | string | null }>(
        SUM_STOCK_SQL,
        [id],
      );
      fallback[id] = Number(rows?.[0]?.s ?? 0);
    }
    return fallback;
  }

  const placeholders = uniqueIds.map((_, index) => `$${index + 1}`).join(",");
  const rows = await db.select<{ item_id: string; s: number | string | null }>(
    `SELECT item_id, COALESCE(SUM(qty), 0) AS s
       FROM stock_movements
      WHERE item_id IN (${placeholders})
      GROUP BY item_id`,
    uniqueIds,
  );

  const totals: Record<string, number> = {};
  for (const id of uniqueIds) {
    totals[id] = 0;
  }

  for (const row of rows) {
    if (!row) continue;
    const { item_id, s } = row;
    if (typeof item_id !== "string") continue;
    totals[item_id] = Number(s ?? 0);
  }

  return totals;
}

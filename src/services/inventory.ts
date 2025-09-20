import { openDb } from "@/db/index";

export type Item = {
  id: string;
  sku: string;
  name: string;
  category?: string | null;
  created_at: string;
};

export async function createItem(
  sku: string,
  name: string,
  category?: string | null,
): Promise<Item> {
  const db = await openDb();
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  await db.execute(
    "INSERT INTO items (id,sku,name,category,created_at) VALUES ($1,$2,$3,$4,$5)",
    [id, sku.trim(), name.trim(), category ?? null, created_at],
  );
  return {
    id,
    sku: sku.trim(),
    name: name.trim(),
    category: category ?? null,
    created_at,
  };
}

export async function getItemBySku(sku: string): Promise<Item | null> {
  const db = await openDb();
  const rows = await db.select("SELECT * FROM items WHERE sku = $1", [
    sku.trim(),
  ]);
  return rows.length ? (rows[0] as Item) : null;
}

type ItemWithStockRow = Item & { stock: number | string | null };

export async function listItems(): Promise<Array<Item & { stock: number }>> {
  const db = await openDb();
  const rows = await db.select<ItemWithStockRow>(
    `SELECT i.id, i.sku, i.name, i.category, i.created_at,
            COALESCE(SUM(m.qty), 0) AS stock
       FROM items i
       LEFT JOIN stock_movements m ON m.item_id = i.id
      GROUP BY i.id, i.sku, i.name, i.category, i.created_at
      ORDER BY i.created_at DESC`
  );
  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? null,
    created_at: row.created_at,
    stock: Number(row.stock ?? 0)
  }));
}

export async function adjustStock(
  itemId: string,
  qty: number,
  reason: string,
  meta?: any,
) {
  if (!Number.isInteger(qty) || qty === 0)
    throw new Error("qty doit être un entier non nul");
  const db = await openDb();
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  await db.execute(
    "INSERT INTO stock_movements (id,item_id,qty,reason,meta,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
    [id, itemId, qty, reason, meta ? JSON.stringify(meta) : null, created_at],
  );
  return { id, item_id: itemId, qty, reason, created_at };
}

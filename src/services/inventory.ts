import { openDb, sumStockForItems } from "@/db/index";

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

export async function listItems(): Promise<Array<Item & { stock: number }>> {
  const db = await openDb();
  const rows = await db.select<Item>(
    `SELECT id, sku, name, category, created_at
       FROM items
      ORDER BY created_at DESC`
  );

  const stocks = await sumStockForItems(rows.map((row) => row.id));

  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? null,
    created_at: row.created_at,
    stock: stocks[row.id] ?? 0,
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

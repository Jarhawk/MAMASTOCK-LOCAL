import { openDb, sumStock } from "@/db/index";import { isTauri } from "@/lib/runtime/isTauri";

export type Item = {id: string;sku: string;name: string;category?: string | null;created_at: string;};

export async function createItem(sku: string, name: string, category?: string | null): Promise<Item> {
  const db = await openDb();
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  await db.execute(
    "INSERT INTO items (id,sku,name,category,created_at) VALUES ($1,$2,$3,$4,$5)",
    [id, sku.trim(), name.trim(), category ?? null, created_at]
  );
  return { id, sku: sku.trim(), name: name.trim(), category: category ?? null, created_at };
}

export async function getItemBySku(sku: string): Promise<Item | null> {
  const db = await openDb();
  const rows = await db.select("SELECT * FROM items WHERE sku = $1", [sku.trim()]);
  return rows.length ? rows[0] as Item : null;
}

export async function listItems(): Promise<Array<Item & {stock: number;}>> {
  const db = await openDb();
  const rows = await db.select("SELECT * FROM items ORDER BY created_at DESC");
  const out: Array<Item & {stock: number;}> = [];
  for (const r of rows as Item[]) {
    out.push({ ...r, stock: await sumStock(r.id) });
  }
  return out;
}

export async function adjustStock(itemId: string, qty: number, reason: string, meta?: any) {
  if (!Number.isInteger(qty) || qty === 0) throw new Error("qty doit être un entier non nul");
  const db = await openDb();
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  await db.execute(
    "INSERT INTO stock_movements (id,item_id,qty,reason,meta,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
    [id, itemId, qty, reason, meta ? JSON.stringify(meta) : null, created_at]
  );
  return { id, item_id: itemId, qty, reason, created_at };
}
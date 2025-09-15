// src/local/db.ts
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/runtime/isTauri";

export { getDb };

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  return await db.select<T[]>(sql, params);
}

export async function exec(sql: string, params: any[] = []): Promise<void> {
  const db = await getDb();
  await db.execute(sql, params);
}

export async function one<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length ? rows[0] : null;
}
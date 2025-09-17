import Database from "@tauri-apps/plugin-sql";
import { getPgUrl } from "@/lib/config/pg";

let _db: Database | null = null;

export async function openPg(): Promise<Database> {
  if (_db) return _db;
  const url = await getPgUrl(); // e.g. postgresql://...
  _db = await Database.load(url);
  return _db;
}

/** Test simple de connectivité (SELECT 1) */
export async function testPg(): Promise<boolean> {
  try {
    const db = await openPg();
    const rows = await db.select("select 1 as ok");
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

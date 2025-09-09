import Database from "@tauri-apps/plugin-sql";
import { appDataPath } from "@/lib/paths";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { dirname } from "@tauri-apps/api/path";

let _db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (_db) return _db;
  const file = await appDataPath("mamastock.db");
  const dir = await dirname(file);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  _db = await Database.load(`sqlite:${file}`);
  return _db!;
}

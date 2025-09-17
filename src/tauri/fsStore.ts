import { getDb } from "@/lib/db/sql";
import { isTauri } from "@/lib/tauriEnv";
import { join } from "@tauri-apps/api/path";
import { getDataDir } from "@/lib/paths";

type Json = unknown;

const BROWSER_NS = "mamastock";

function lsKey(rel: string) { return `${BROWSER_NS}:${rel.replace(/\\/g,'/')}`; }

export async function readJsonFile(rel: string): Promise<Json | null> {
  if (!isTauri()) {
    const v = localStorage.getItem(lsKey(rel));
    return v ? JSON.parse(v) : null;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  const root = await getDataDir();
  const path = await join(root, rel);
  if (!(await fs.exists(path))) return null;
  const txt = await fs.readTextFile(path);
  return JSON.parse(txt);
}

export async function writeJsonFile(rel: string, data: Json): Promise<string> {
  if (!isTauri()) {
    localStorage.setItem(lsKey(rel), JSON.stringify(data));
    return rel;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  const root = await getDataDir();
  const path = await join(root, rel);
  await fs.writeTextFile(path, JSON.stringify(data, null, 2));
  return path;
}

export async function ensureDataDir(): Promise<string> {
  if (!isTauri()) return "localStorage://" + BROWSER_NS;
  // CODEREVIEW: rely on AppData helper to guarantee safe writable directory
  return getDataDir();
}

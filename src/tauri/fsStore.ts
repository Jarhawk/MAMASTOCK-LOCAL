import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/tauriEnv";
import { inAppDir } from "@/lib/paths";

type Json = unknown;

const BROWSER_NS = "mamastock";

function lsKey(rel: string) { return `${BROWSER_NS}:${rel.replace(/\\/g,'/')}`; }

export async function readJsonFile(rel: string): Promise<Json | null> {
  if (!isTauri()) {
    const v = localStorage.getItem(lsKey(rel));
    return v ? JSON.parse(v) : null;
  }
  const { join } = await import("@tauri-apps/api/path");
  const fs = await import("@tauri-apps/plugin-fs");
  const root = await inAppDir("data");
  const mkdir = (fs as any).createDir ?? (fs as any).mkdir; // support both names
  await mkdir(root, { recursive: true });
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
  const { join } = await import("@tauri-apps/api/path");
  const fs = await import("@tauri-apps/plugin-fs");
  const root = await inAppDir("data");
  const mkdir = (fs as any).createDir ?? (fs as any).mkdir;
  await mkdir(root, { recursive: true });
  const path = await join(root, rel);
  await fs.writeTextFile(path, JSON.stringify(data, null, 2));
  return path;
}

export async function ensureDataDir(): Promise<string> {
  if (!isTauri()) return "localStorage://" + BROWSER_NS;
  const fs = await import("@tauri-apps/plugin-fs");
  const root = await inAppDir("data");
  const mkdir = (fs as any).createDir ?? (fs as any).mkdir;
  await mkdir(root, { recursive: true });
  return root;
}

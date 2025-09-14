import { isTauri } from "@/lib/db/sql";

const APP_DIR = "MamaStock";

async function baseDir() {
  if (!isTauri) throw new Error("Tauri requis");
  const { appDataDir, join } = await import("@tauri-apps/api/path");
  const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
  const base = await appDataDir();
  const dir = await join(base, APP_DIR);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return dir;
}

async function resolve(path: string) {
  const root = await baseDir();
  const { join } = await import("@tauri-apps/api/path");
  return await join(root, path);
}

export async function saveText(relPath: string, content: string) {
  if (!isTauri) throw new Error("Tauri requis");
  const file = await resolve(relPath);
  const { dirname } = await import("@tauri-apps/api/path");
  const { exists, mkdir, writeTextFile } = await import("@tauri-apps/plugin-fs");
  const dir = await dirname(file);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  await writeTextFile(file, content);
}

export async function readText(relPath: string) {
  if (!isTauri) throw new Error("Tauri requis");
  const file = await resolve(relPath);
  const { readTextFile } = await import("@tauri-apps/plugin-fs");
  return await readTextFile(file);
}

export async function existsFile(relPath: string) {
  if (!isTauri) throw new Error("Tauri requis");
  const file = await resolve(relPath);
  const { exists } = await import("@tauri-apps/plugin-fs");
  return await exists(file);
}

export async function mkdirp(relDir: string) {
  if (!isTauri) throw new Error("Tauri requis");
  const dir = await resolve(relDir);
  const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
}

export async function saveBinary(relPath: string, data: Uint8Array) {
  if (!isTauri) throw new Error("Tauri requis");
  const file = await resolve(relPath);
  const { dirname } = await import("@tauri-apps/api/path");
  const { exists, mkdir, writeFile } = await import("@tauri-apps/plugin-fs");
  const dir = await dirname(file);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  await writeFile(file, data);
}

export async function readBinary(relPath: string) {
  if (!isTauri) throw new Error("Tauri requis");
  const file = await resolve(relPath);
  const { readFile } = await import("@tauri-apps/plugin-fs");
  return await readFile(file);
}

export async function deleteFile(relPath: string) {
  if (!isTauri) throw new Error("Tauri requis");
  const file = await resolve(relPath);
  const { exists, remove } = await import("@tauri-apps/plugin-fs");
  if (await exists(file)) await remove(file);
}

import { appDataDir, join, dirname } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
  writeFile,
  readFile,
  remove,
} from "@tauri-apps/plugin-fs";

const APP_DIR = "MamaStock";

async function baseDir() {
  const base = await appDataDir();
  const dir = await join(base, APP_DIR);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return dir;
}

async function resolve(path: string) {
  const root = await baseDir();
  return await join(root, path);
}

export async function saveText(relPath: string, content: string) {
  const file = await resolve(relPath);
  const dir = await dirname(file);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  await writeTextFile(file, content);
}

export async function readText(relPath: string) {
  const file = await resolve(relPath);
  return await readTextFile(file);
}

export async function existsFile(relPath: string) {
  const file = await resolve(relPath);
  return await exists(file);
}

export async function mkdirp(relDir: string) {
  const dir = await resolve(relDir);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
}

export async function saveBinary(relPath: string, data: Uint8Array) {
  const file = await resolve(relPath);
  const dir = await dirname(file);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  await writeFile(file, data);
}

export async function readBinary(relPath: string) {
  const file = await resolve(relPath);
  return await readFile(file);
}

export async function deleteFile(relPath: string) {
  const file = await resolve(relPath);
  if (await exists(file)) await remove(file);
}

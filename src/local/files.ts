import { dirname, join } from "@tauri-apps/api/path";
import { isTauri } from "@/lib/tauriEnv";
import { getAppDir } from "@/lib/paths";

const NOT_TAURI_HINT =
  "Vous êtes dans le navigateur de développement. Ouvrez la fenêtre Tauri pour activer SQLite.";

async function baseDir() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  // CODEREVIEW: unify base directory resolution with AppData helper
  const dir = await getAppDir();
  return dir;
}

async function resolve(path: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return path;
  }
  const root = await baseDir();
  return await join(root, path);
}

export async function saveText(relPath: string, content: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return;
  }
  const file = await resolve(relPath);
  const { exists, mkdir, writeTextFile } = await import("@tauri-apps/plugin-fs");
  const dir = await dirname(file);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  await writeTextFile(file, content);
}

export async function readText(relPath: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const file = await resolve(relPath);
  const { readTextFile } = await import("@tauri-apps/plugin-fs");
  return await readTextFile(file);
}

export async function existsFile(relPath: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return false;
  }
  const file = await resolve(relPath);
  const { exists } = await import("@tauri-apps/plugin-fs");
  return await exists(file);
}

export async function mkdirp(relDir: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return;
  }
  const dir = await resolve(relDir);
  const { exists, mkdir } = await import("@tauri-apps/plugin-fs");
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
}

export async function saveBinary(relPath: string, data: Uint8Array) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return;
  }
  const file = await resolve(relPath);
  const { exists, mkdir, writeFile } = await import("@tauri-apps/plugin-fs");
  const dir = await dirname(file);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  await writeFile(file, data);
}

export async function readBinary(relPath: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return new Uint8Array();
  }
  const file = await resolve(relPath);
  const { readFile } = await import("@tauri-apps/plugin-fs");
  return await readFile(file);
}

export async function deleteFile(relPath: string) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return;
  }
  const file = await resolve(relPath);
  const { exists, remove } = await import("@tauri-apps/plugin-fs");
  if (await exists(file)) await remove(file);
}

import {
  BaseDirectory,
  createDir,
  writeTextFile,
  readTextFile,
  exists
} from "@tauri-apps/plugin-fs";

export const APP_DIR = "MamaStock";
export const APP_BASE = BaseDirectory.AppData;

export async function ensureAppDir() {
  await createDir(APP_DIR, { dir: APP_BASE, recursive: true });
}

export async function writeAppJson(relPath: string, data: unknown) {
  await ensureAppDir();
  const path = `${APP_DIR}/${relPath}`;
  await writeTextFile(path, JSON.stringify(data, null, 2), { dir: APP_BASE });
}

export async function readAppText(relPath: string) {
  const path = `${APP_DIR}/${relPath}`;
  if (!(await exists(path, { dir: APP_BASE }))) return null;
  return await readTextFile(path, { dir: APP_BASE });
}

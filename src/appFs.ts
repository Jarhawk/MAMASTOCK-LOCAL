import { mkdir, exists, BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export async function ensureAppDir(sub = "MamaStock") {
  await mkdir(sub, { recursive: true, dir: BaseDirectory.AppData });
}

export async function writeAppText(path: string, contents: string) {
  await writeTextFile(path, contents, { dir: BaseDirectory.AppData });
}

export async function readAppText(path: string) {
  return await readTextFile(path, { dir: BaseDirectory.AppData });
}

export async function appPathExists(path: string) {
  return await exists(path, { dir: BaseDirectory.AppData });
}

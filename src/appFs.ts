import { mkdir, exists, BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isTauri } from "@/isTauri";

export async function ensureAppDir(sub = "MamaStock") {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  await mkdir(sub, { recursive: true, dir: BaseDirectory.AppData });
}

export async function writeAppText(path: string, contents: string) {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  await writeTextFile(path, contents, { dir: BaseDirectory.AppData });
}

export async function readAppText(path: string) {
  if (!isTauri()) {
    console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    return "";
  }
  return await readTextFile(path, { dir: BaseDirectory.AppData });
}

export async function appPathExists(path: string) {
  if (!isTauri()) {
    console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
    return false;
  }
  return await exists(path, { dir: BaseDirectory.AppData });
}

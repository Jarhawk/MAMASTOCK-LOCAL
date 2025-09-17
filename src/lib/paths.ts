// src/lib/paths.ts
import { appDataDir, join } from "@tauri-apps/api/path";
import { mkdir } from "@tauri-apps/plugin-fs";
import { isTauri } from "@/lib/tauriEnv";

const NOT_TAURI_HINT =
  "Vous êtes dans le navigateur de développement. Ouvrez la fenêtre Tauri pour activer SQLite.";
export const APP_DIR = "MamaStock";

// CODEREVIEW: centralize safe app paths under AppData
async function ensureDir(path: string) {
  try {
    await mkdir(path, { recursive: true });
  } catch (err) {
    const message = String(err ?? "");
    if (!/exists/i.test(message)) {
      throw err;
    }
  }
}

async function ensureAppRoot() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const base = await appDataDir();
  const root = await join(base, APP_DIR);
  await ensureDir(root);
  return root;
}

export async function getAppDir() {
  return ensureAppRoot();
}

export async function inAppDir(...parts: string[]) {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const root = await ensureAppRoot();
  let current = root;
  for (const part of parts) {
    current = await join(current, part);
  }
  return current;
}

export async function getDataDir() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const root = await ensureAppRoot();
  const data = await join(root, "data");
  await ensureDir(data);
  return data;
}

export async function getDbPath() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const dir = await getDataDir();
  return join(dir, "mamastock.db");
}

export async function getExportsDir() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const dir = await getDataDir();
  const exportsDir = await join(dir, "exports");
  await ensureDir(exportsDir);
  return exportsDir;
}

export async function dataDbPath() {
  return getDbPath();
}

export async function configPath() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const root = await ensureAppRoot();
  return join(root, "config.json");
}

export async function locksPath() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const dir = await getDataDir();
  return join(dir, "db.lock.json");
}

export async function shutdownRequestPath() {
  if (!isTauri()) {
    console.warn(NOT_TAURI_HINT);
    return "";
  }
  const dir = await getDataDir();
  return join(dir, "shutdown.request.json");
}

import { v4 as uuidv4 } from "uuid";
import { shutdownDbSafely } from "./shutdown";
import { isTauri } from "@/tauriEnv";
import { readJsonFile, writeJsonFile, ensureDataDir } from "/src/tauri/fsStore";

const TTL = 20_000; // 20s
const HEARTBEAT = 5_000; // 5s
const BROWSER_NS = "mamastock";

const instanceId = uuidv4();
let heartbeat: ReturnType<typeof setInterval> | null = null;

async function removeJson(rel: string) {
  if (!isTauri()) {
    localStorage.removeItem(`${BROWSER_NS}:${rel.replace(/\\/g, '/')}`);
    return;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  const { join } = await import("@tauri-apps/api/path");
  const root = await ensureDataDir();
  const path = await join(root, rel);
  if (await fs.exists(path)) await fs.remove(path);
}

export async function ensureSingleOwner(waitMs = 30_000) {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  const start = Date.now();
  let requested = false;
  // check for existing lock file
  // loop while lock exists
  while (true) {
    let lock: any = null;
    try {
      lock = await readJsonFile("db.lock.json");
    } catch {
      lock = null;
    }
    if (!lock) break;
    try {
      const { ts } = lock as any;
      if (Date.now() - ts > TTL) {
        break; // stale lock
      }
    } catch {
      // ignore parse errors
    }
    if (!requested) {
      await requestRemoteShutdown();
      requested = true;
    }
    if (Date.now() - start > waitMs) {
      throw new Error("Database already locked");
    }
    await new Promise((r) => setTimeout(r, HEARTBEAT));
  }
  await writeJsonFile("db.lock.json", { ts: Date.now(), id: instanceId });
  heartbeat = setInterval(async () => {
    await writeJsonFile("db.lock.json", { ts: Date.now(), id: instanceId });
  }, HEARTBEAT);
}

export async function monitorShutdownRequests() {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
  const appWindow = getCurrentWebviewWindow();
  const check = async () => {
    try {
      const req: any = await readJsonFile("shutdown.request.json");
      if (req && req.requester !== instanceId) {
        await shutdownDbSafely();
        await releaseLock();
        await removeJson("shutdown.request.json");
        await appWindow.close();
      }
    } catch {
      await removeJson("shutdown.request.json");
    }
  };
  await check();
  setInterval(check, HEARTBEAT);
}

export async function requestRemoteShutdown() {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  await writeJsonFile("shutdown.request.json", { ts: Date.now(), requester: instanceId });
}

export async function releaseLock() {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
  try {
    const lock = await readJsonFile("db.lock.json");
    if (lock) {
      await removeJson("db.lock.json");
    }
  } catch {
    // ignore errors
  }
}

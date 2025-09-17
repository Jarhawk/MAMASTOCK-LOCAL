import { v4 as uuidv4 } from "uuid";

import { getDb } from "@/lib/db/database";
import { locksPath, shutdownRequestPath } from "@/lib/paths";
import { isTauri } from "@/lib/tauriEnv";

import { shutdownDbSafely } from "./shutdown";

const TTL = 20_000; // 20s
const HEARTBEAT = 5_000; // 5s
const BROWSER_NS = "mamastock";

const instanceId = uuidv4();
let heartbeat: ReturnType<typeof setInterval> | null = null;

async function readLock() {
  if (!isTauri()) {
    const v = localStorage.getItem(`${BROWSER_NS}:db.lock.json`);
    return v ? JSON.parse(v) : null;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  const path = await locksPath();
  if (!(await fs.exists(path))) return null;
  const txt = await fs.readTextFile(path);
  return JSON.parse(txt);
}

async function writeLock(data: any) {
  if (!isTauri()) {
    localStorage.setItem(`${BROWSER_NS}:db.lock.json`, JSON.stringify(data));
    return;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  // CODEREVIEW: path resolved via centralized helper to stay within AppData scope
  const path = await locksPath();
  await fs.writeTextFile(path, JSON.stringify(data));
}

async function removeLock() {
  if (!isTauri()) {
    localStorage.removeItem(`${BROWSER_NS}:db.lock.json`);
    return;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  const path = await locksPath();
  if (await fs.exists(path)) await fs.remove(path);
}

async function readShutdownRequest() {
  if (!isTauri()) {
    const v = localStorage.getItem(`${BROWSER_NS}:shutdown.request.json`);
    return v ? JSON.parse(v) : null;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  // CODEREVIEW: shared shutdown marker now reuses centralized AppData helper
  const path = await shutdownRequestPath();
  if (!(await fs.exists(path))) return null;
  const txt = await fs.readTextFile(path);
  return JSON.parse(txt);
}

async function writeShutdownRequest(data: any) {
  if (!isTauri()) {
    localStorage.setItem(`${BROWSER_NS}:shutdown.request.json`, JSON.stringify(data));
    return;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  // CODEREVIEW: ensure shutdown signal stays within managed AppData folder
  const path = await shutdownRequestPath();
  await fs.writeTextFile(path, JSON.stringify(data));
}

async function removeShutdownRequest() {
  if (!isTauri()) {
    localStorage.removeItem(`${BROWSER_NS}:shutdown.request.json`);
    return;
  }
  const fs = await import("@tauri-apps/plugin-fs");
  const path = await shutdownRequestPath();
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
      lock = await readLock();
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
  await writeLock({ ts: Date.now(), id: instanceId });
  heartbeat = setInterval(async () => {
    await writeLock({ ts: Date.now(), id: instanceId });
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
      const req: any = await readShutdownRequest();
      if (req && req.requester !== instanceId) {
        await shutdownDbSafely();
        await releaseLock();
        await removeShutdownRequest();
        await appWindow.close();
      }
    } catch {
      await removeShutdownRequest();
    }
  };
  await check();
  setInterval(check, HEARTBEAT);
}

export async function requestRemoteShutdown() {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  await writeShutdownRequest({ ts: Date.now(), requester: instanceId });
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
    const lock = await readLock();
    if (lock) {
      await removeLock();
    }
  } catch {
    // ignore errors
  }
}

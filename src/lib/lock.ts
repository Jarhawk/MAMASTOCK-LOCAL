import { v4 as uuidv4 } from "uuid";
import { shutdownDbSafely } from "./shutdown";
import { isTauri } from "@/tauriEnv";
import { readJsonInApp, writeJsonInApp, removeInApp } from "@/fsSafe";
import { existsAppPath } from "@/paths";

const TTL = 20_000; // 20s
const HEARTBEAT = 5_000; // 5s

const instanceId = uuidv4();
let heartbeat: ReturnType<typeof setInterval> | null = null;

export async function ensureSingleOwner(waitMs = 30_000) {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  const parts = ["data", "db.lock.json"];
  const start = Date.now();
  let requested = false;
  while (await existsAppPath(...parts)) {
    try {
      const { ts } = (await readJsonInApp<any>(...parts)) || { ts: 0 };
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
  await writeJsonInApp({ ts: Date.now(), id: instanceId }, ...parts);
  heartbeat = setInterval(async () => {
    await writeJsonInApp({ ts: Date.now(), id: instanceId }, ...parts);
  }, HEARTBEAT);
}

export async function monitorShutdownRequests() {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  const parts = ["data", "shutdown.request.json"];
  const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
  const appWindow = getCurrentWebviewWindow();
  const check = async () => {
    try {
      const req = await readJsonInApp<any>(...parts);
      if (req && req.requester !== instanceId) {
        await shutdownDbSafely();
        await releaseLock();
        await removeInApp(...parts);
        await appWindow.close();
      }
    } catch {
      await removeInApp(...parts);
    }
  };
  await check();
  setInterval(check, HEARTBEAT);
}

export async function requestRemoteShutdown() {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  await writeJsonInApp({ ts: Date.now(), requester: instanceId }, "data", "shutdown.request.json");
}

export async function releaseLock() {
  if (!isTauri()) {
    return console.debug('Tauri indisponible (navigateur): ne pas appeler les plugins ici.');
  }
  const parts = ["data", "db.lock.json"];
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
  if (await existsAppPath(...parts)) {
    await removeInApp(...parts);
  }
}

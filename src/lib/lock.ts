import { join } from "@tauri-apps/api/path";
import { exists, readTextFile, writeTextFile, remove, BaseDirectory } from "@tauri-apps/plugin-fs";
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { v4 as uuidv4 } from "uuid";
import { shutdownDbSafely } from "./shutdown";
import { isTauri } from "@/lib/isTauri";

const appWindow = isTauri ? getCurrentWebviewWindow() : null;

const TTL = 20_000; // 20s
const HEARTBEAT = 5_000; // 5s

const instanceId = uuidv4();
let heartbeat: ReturnType<typeof setInterval> | null = null;

async function path(dir: string, file: string) {
  return await join(dir, file);
}

export async function ensureSingleOwner(syncDir: string, waitMs = 30_000) {
  const lockPath = await path(syncDir, "db.lock.json");
  const start = Date.now();
  let requested = false;
  while (await exists(lockPath, { dir: BaseDirectory.AppData })) {
    try {
      const { ts } = JSON.parse(await readTextFile(lockPath, { dir: BaseDirectory.AppData }));
      if (Date.now() - ts > TTL) {
        break; // stale lock
      }
    } catch {
      // ignore parse errors
    }
    if (!requested) {
      await requestRemoteShutdown(syncDir);
      requested = true;
    }
    if (Date.now() - start > waitMs) {
      throw new Error("Database already locked");
    }
    await new Promise((r) => setTimeout(r, HEARTBEAT));
  }
  await writeTextFile(lockPath, JSON.stringify({ ts: Date.now(), id: instanceId }), { dir: BaseDirectory.AppData });
  heartbeat = setInterval(async () => {
    await writeTextFile(lockPath, JSON.stringify({ ts: Date.now(), id: instanceId }), { dir: BaseDirectory.AppData });
  }, HEARTBEAT);
}

export async function monitorShutdownRequests(syncDir: string) {
  const shutdownPath = await path(syncDir, "shutdown.request.json");
  const check = async () => {
    if (await exists(shutdownPath, { dir: BaseDirectory.AppData })) {
      try {
        const { requester } = JSON.parse(await readTextFile(shutdownPath, { dir: BaseDirectory.AppData }));
        if (requester !== instanceId) {
          await shutdownDbSafely();
          await releaseLock(syncDir);
          await remove(shutdownPath, { dir: BaseDirectory.AppData });
          await appWindow.close();
        }
      } catch {
        await remove(shutdownPath, { dir: BaseDirectory.AppData });
      }
    }
  };
  await check();
  setInterval(check, HEARTBEAT);
}

export async function requestRemoteShutdown(syncDir: string) {
  const shutdownPath = await path(syncDir, "shutdown.request.json");
  await writeTextFile(shutdownPath, JSON.stringify({ ts: Date.now(), requester: instanceId }), { dir: BaseDirectory.AppData });
}

export async function releaseLock(syncDir: string) {
  const lockPath = await path(syncDir, "db.lock.json");
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
  if (await exists(lockPath, { dir: BaseDirectory.AppData })) {
    await remove(lockPath, { dir: BaseDirectory.AppData });
  }
}

import { join } from "@tauri-apps/api/path";
import { exists, readTextFile, writeTextFile, removeFile } from "@tauri-apps/api/fs";
import { getDataDir } from "./db";

const TTL = 20_000; // 20s
const HEARTBEAT = 5_000; // 5s

let heartbeat: ReturnType<typeof setInterval> | null = null;

export async function ensureSingleOwner() {
  const dir = await getDataDir();
  const lockPath = await join(dir, "db.lock.json");
  const now = Date.now();
  if (await exists(lockPath)) {
    try {
      const { ts } = JSON.parse(await readTextFile(lockPath));
      if (now - ts < TTL) {
        throw new Error("Database already locked");
      }
    } catch (_) {
      /* ignore */
    }
  }
  await writeTextFile(lockPath, JSON.stringify({ ts: now }));
  heartbeat = setInterval(async () => {
    await writeTextFile(lockPath, JSON.stringify({ ts: Date.now() }));
  }, HEARTBEAT);
}

export async function monitorShutdownRequests(handler: () => void) {
  const dir = await getDataDir();
  const shutdownPath = await join(dir, "shutdown.request.json");
  const check = async () => {
    if (await exists(shutdownPath)) {
      await removeFile(shutdownPath);
      await handler();
    }
  };
  await check();
  setInterval(check, HEARTBEAT);
}

export async function releaseLock() {
  const dir = await getDataDir();
  const lockPath = await join(dir, "db.lock.json");
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
  if (await exists(lockPath)) {
    await removeFile(lockPath);
  }
}

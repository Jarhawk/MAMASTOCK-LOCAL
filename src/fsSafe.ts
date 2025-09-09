import { isTauri } from "./tauriEnv";
import { appFile } from "./paths";

let fs: any = null;
async function ensureFs() {
  if (!isTauri()) return;
  if (!fs) fs = await import("@tauri-apps/plugin-fs");
}

const LS = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch {} },
  del(k: string) { try { localStorage.removeItem(k); } catch {} },
};

export async function readJsonInApp<T=any>(...parts: string[]): Promise<T|null> {
  if (!isTauri()) {
    const v = LS.get(["MS", ...parts].join(":"));
    return v ? JSON.parse(v) : null;
  }
  await ensureFs();
  const file = await appFile(...parts);
  if (!await fs.exists(file)) return null;
  const txt = await fs.readTextFile(file);
  return JSON.parse(txt);
}

export async function writeJsonInApp(obj: any, ...parts: string[]) {
  if (!isTauri()) {
    LS.set(["MS", ...parts].join(":"), JSON.stringify(obj));
    return;
  }
  await ensureFs();
  const file = await appFile(...parts);
  await fs.writeTextFile(file, JSON.stringify(obj, null, 2));
}

export async function removeInApp(...parts: string[]) {
  if (!isTauri()) {
    LS.del(["MS", ...parts].join(":"));
    return;
  }
  await ensureFs();
  const file = await appFile(...parts);
  if (await fs.exists(file)) await fs.remove(file);
}

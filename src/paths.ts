import { isTauri } from "./tauriEnv";

let fs: any = null;
let pathApi: any = null;

async function ensureApis() {
  if (!isTauri()) return;
  if (!fs) fs = await import("@tauri-apps/plugin-fs");
  if (!pathApi) pathApi = await import("@tauri-apps/api/path");
}

export async function appFile(...parts: string[]) {
  // returns an absolute file path inside appDataDir/MamaStock/...
  await ensureApis();
  if (!isTauri()) throw new Error("appFile only available in Tauri");
  const base = await pathApi.appDataDir();
  const folder = await pathApi.join(base, "MamaStock", ...(parts.slice(0, -1)));
  const mkdir = (fs as any).mkdir || (fs as any).createDir;
  await mkdir(folder, { recursive: true });
  return pathApi.join(base, "MamaStock", ...parts);
}

export async function appDir(...parts: string[]) {
  await ensureApis();
  if (!isTauri()) throw new Error("appDir only available in Tauri");
  const base = await pathApi.appDataDir();
  const dir = await pathApi.join(base, "MamaStock", ...parts);
  const mkdir = (fs as any).mkdir || (fs as any).createDir;
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function existsAppPath(...parts: string[]) {
  await ensureApis();
  const p = await appFile(...parts);
  return (fs as any).exists(p);
}

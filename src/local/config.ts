export type AppConfig = { dbUrl: string };
export async function loadConfig(): Promise<AppConfig> {
  const { configDir } = await import("@tauri-apps/api/path");
  const { readTextFile, writeTextFile, createDir, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  const dir = await configDir();
  const appDir = dir + "MamaStock/";
  try { await createDir(appDir, { recursive: true }); } catch {}
  const file = appDir + "config.json";
  try {
    const raw = await readTextFile(file);
    const parsed = JSON.parse(raw);
    if (typeof parsed?.dbUrl === "string" && parsed.dbUrl.startsWith("postgres")) return { dbUrl: parsed.dbUrl };
  } catch {}
  // fallback: VITE_DB_URL si présent au build
  const fromEnv = (import.meta as any)?.env?.VITE_DB_URL;
  const dbUrl = (typeof fromEnv === "string" && fromEnv.startsWith("postgres")) ? fromEnv : "";
  await writeTextFile(file, JSON.stringify({ dbUrl }, null, 2));
  return { dbUrl };
}
export async function saveDbUrl(url: string) {
  const { configDir } = await import("@tauri-apps/api/path");
  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  const dir = await configDir();
  await writeTextFile(dir + "MamaStock/config.json", JSON.stringify({ dbUrl: url }, null, 2));
}

import { documentDir, join } from "@tauri-apps/api/path";
import { createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";

const CONFIG_FILE = "export.config.json";

async function configPath(): Promise<string> {
  const base = await documentDir();
  const dir = await join(base, "MamaStock");
  await createDir(dir, { recursive: true });
  return await join(dir, CONFIG_FILE);
}

export async function getExportDir(): Promise<string> {
  const cfg = await configPath();
  if (await exists(cfg)) {
    try {
      const data = JSON.parse(await readTextFile(cfg));
      if (data.exportDir) return data.exportDir as string;
    } catch {
      /* ignore */
    }
  }
  const base = await documentDir();
  return await join(base, "MamaStock", "Exports");
}

export async function setExportDir(dir: string) {
  const cfg = await configPath();
  await createDir(dir, { recursive: true });
  await writeTextFile(cfg, JSON.stringify({ exportDir: dir }));
}

import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, writeFile } from "@tauri-apps/plugin-fs";

export async function appendLog(line: string) {
  try {
    const dir = await appDataDir();
    const logDir = await join(dir, "logs");
    if (!(await exists(logDir))) {
      await mkdir(logDir, { recursive: true });
    }
    const file = await join(logDir, "renderer.log");
    const msg = new TextEncoder().encode(line + "\n");
    await writeFile(file, msg, { append: true });
  } catch (e) {
    console.error("appendLog failed", e);
  }
}

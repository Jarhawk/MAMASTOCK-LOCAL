import { readJsonFile, writeJsonFile } from "/src/tauri/fsStore";

export type Config = Record<string, any>;

export async function readConfig(): Promise<Config | null> {
  return (await readJsonFile("config.json")) as Config | null;
}

export async function writeConfig(cfg: Config): Promise<void> {
  await writeJsonFile("config.json", cfg);
}

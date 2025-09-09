import { readJsonInApp, writeJsonInApp } from "./fsSafe";

export type Config = Record<string, any>;

export async function readConfig(): Promise<Config | null> {
  return readJsonInApp<Config>("config.json");
}

export async function writeConfig(cfg: Config): Promise<void> {
  await writeJsonInApp(cfg, "config.json");
}

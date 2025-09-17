import { log } from "@/tauriLog";
import { isTauri } from "@/lib/tauriEnv";

const APP_DIR = "MamaStock";
const CONFIG_FILE = "config.json";

type RawAppConfig = {
  db?: {
    type?: string;
    url?: string;
  } | null;
  dbUrl?: string;
  [key: string]: unknown;
};

type DbConfig = {
  type: string;
  url: string;
};

let cachedConfigPath: string | null | undefined;

function trimTrailingSlash(path: string) {
  return path.replace(/[\\/]+$/, "");
}

async function ensureDir(path: string) {
  const { mkdir } = await import("@tauri-apps/plugin-fs");
  try {
    await mkdir(path, { recursive: true });
  } catch (err) {
    const message = String(err ?? "");
    if (!/exists/i.test(message)) {
      throw err;
    }
  }
}

async function resolveConfigRoot(): Promise<string | null> {
  if (!isTauri()) return null;

  const pathApi = await import("@tauri-apps/api/path");
  const candidates: string[] = [];

  try {
    const dir = await pathApi.appConfigDir();
    if (dir) candidates.push(dir);
  } catch (err) {
    log.warn("[config] appConfigDir() indisponible", err);
  }

  try {
    const dir = await pathApi.configDir();
    if (dir) candidates.push(dir);
  } catch (err) {
    log.warn("[config] configDir() indisponible", err);
  }

  try {
    const dir = await pathApi.appDataDir();
    if (dir) candidates.push(dir);
  } catch (err) {
    log.warn("[config] appDataDir() indisponible", err);
  }

  for (const base of candidates) {
    if (!base) continue;
    const trimmed = trimTrailingSlash(base);
    const lower = trimmed.toLowerCase();
    let target = trimmed;
    if (!lower.endsWith(APP_DIR.toLowerCase())) {
      try {
        target = await pathApi.join(trimmed, APP_DIR);
      } catch (err) {
        log.warn("[config] join() impossible pour", trimmed, err);
        continue;
      }
    }
    try {
      await ensureDir(target);
      return target;
    } catch (err) {
      log.error("[config] Impossible de créer le dossier", target, err);
    }
  }

  return null;
}

async function ensureConfigPath(): Promise<string | null> {
  if (cachedConfigPath !== undefined) {
    return cachedConfigPath;
  }
  const dir = await resolveConfigRoot();
  if (!dir) {
    cachedConfigPath = null;
    return null;
  }
  const { join } = await import("@tauri-apps/api/path");
  const file = await join(dir, CONFIG_FILE);
  cachedConfigPath = file;
  return file;
}

async function readRawConfig(): Promise<RawAppConfig | null> {
  if (!isTauri()) return null;
  const path = await ensureConfigPath();
  if (!path) return null;
  const fs = await import("@tauri-apps/plugin-fs");
  const exists = await fs.exists(path);
  if (!exists) return null;
  try {
    const raw = await fs.readTextFile(path);
    const parsed = JSON.parse(raw) as RawAppConfig;
    return parsed ?? null;
  } catch (err) {
    log.error("[config] config.json invalide", err);
    return null;
  }
}

function toDbConfig(raw: RawAppConfig | null): DbConfig | null {
  if (!raw) return null;
  const fromNested = raw.db;
  if (fromNested && typeof fromNested?.url === "string") {
    const type = String(fromNested.type ?? "postgres");
    return {
      type: type.toLowerCase(),
      url: fromNested.url.trim(),
    };
  }
  if (typeof raw.dbUrl === "string" && raw.dbUrl.trim()) {
    const url = raw.dbUrl.trim();
    const type = url.toLowerCase().startsWith("sqlite") ? "sqlite" : "postgres";
    return { type, url };
  }
  return null;
}

async function writeRawConfig(config: RawAppConfig): Promise<void> {
  if (!isTauri()) {
    throw new Error("Écriture de la configuration uniquement disponible sous Tauri");
  }
  const path = await ensureConfigPath();
  if (!path) {
    throw new Error("Impossible de déterminer le chemin du fichier de configuration");
  }
  const { dirname } = await import("@tauri-apps/api/path");
  const dir = await dirname(path);
  await ensureDir(dir);
  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  const payload = { ...config };
  if (payload.dbUrl !== undefined) {
    delete payload.dbUrl;
  }
  await writeTextFile(path, JSON.stringify(payload, null, 2));
}

export async function getConfigFilePath(): Promise<string | null> {
  const path = await ensureConfigPath();
  return path;
}

export async function getDbConfig(): Promise<DbConfig | null> {
  const raw = await readRawConfig();
  return toDbConfig(raw);
}

export async function getPostgresUrl(): Promise<string | null> {
  if (!isTauri()) {
    try {
      const envUrl = (import.meta as any)?.env?.VITE_DB_URL;
      if (typeof envUrl === "string" && envUrl.trim()) {
        return envUrl.trim();
      }
    } catch {
      return null;
    }
    return null;
  }
  const cfg = await getDbConfig();
  if (!cfg) return null;
  if (cfg.type === "postgres" || cfg.type === "postgresql") {
    return cfg.url;
  }
  if (cfg.url.toLowerCase().startsWith("postgres")) {
    return cfg.url;
  }
  return null;
}

export async function getDbUrl(): Promise<string | null> {
  return getPostgresUrl();
}

export async function savePostgresUrl(url: string): Promise<void> {
  if (!url || !url.trim()) {
    throw new Error("URL PostgreSQL invalide");
  }
  const trimmed = url.trim();
  const current = (await readRawConfig()) ?? {};
  const next: RawAppConfig = { ...current, db: { type: "postgres", url: trimmed } };
  await writeRawConfig(next);
}

export async function readAppConfig(): Promise<RawAppConfig | null> {
  return readRawConfig();
}

export async function writeAppConfig(config: RawAppConfig): Promise<void> {
  await writeRawConfig(config);
}

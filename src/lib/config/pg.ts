import { exists, readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { localDataDir, join } from "@tauri-apps/api/path";

const DEFAULT_PG_URL = "postgresql://neondb_owner:npg_bM8mxANEGzd7@ep-falling-field-a9ppe70d-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

const PROGRAMDATA_CFG = "C:\\ProgramData\\MAMASTOCK\\config.json";

async function readJson(path: string): Promise<any | null> {
  try {
    if (!(await exists(path))) return null;
    const txt = await readTextFile(path);
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export async function getUserCfgPath(): Promise<string> {
  const dir = await localDataDir(); // e.g. C:\Users\...\AppData\Local\{org/app}\
  // On force notre dossier app "MAMASTOCK" pour être stable
  const base = dir.replace(/\\[^\\]+\\?$/i, ""); // retire le dernier segment si besoin
  return join(base, "MAMASTOCK", "config.json");
}

/**
 * Retourne l'URL PG selon cette priorité :
 * 1) %ProgramData%\MAMASTOCK\config.json  (administrateur / machine)
 * 2) %LOCALAPPDATA%\MAMASTOCK\config.json (utilisateur)
 * 3) DEFAULT_PG_URL (Neon)
 */
export async function getPgUrl(): Promise<string> {
  // 1) ProgramData (machine-wide)
  const sysCfg = await readJson(PROGRAMDATA_CFG);
  if (sysCfg?.pgUrl) return String(sysCfg.pgUrl);

  // 2) LocalAppData (utilisateur)
  const userCfgPath = await getUserCfgPath();
  const userCfg = await readJson(userCfgPath);
  if (userCfg?.pgUrl) return String(userCfg.pgUrl);

  // 3) Default (Neon) + auto-crée un user config minimal (optionnel mais pratique)
  try {
    const userDir = userCfgPath.replace(/\\config\.json$/i, "");
    if (!(await exists(userDir))) await mkdir(userDir, { recursive: true });
    await writeTextFile(userCfgPath, JSON.stringify({ pgUrl: DEFAULT_PG_URL }, null, 2));
  } catch {
    // silencieux : si on n'a pas pu écrire, on garde juste le défaut en mémoire
  }
  return DEFAULT_PG_URL;
}

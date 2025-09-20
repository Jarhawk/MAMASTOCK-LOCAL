import { invoke } from "@tauri-apps/api/core";

import { isTauri } from "@/lib/tauriEnv";

export async function getDbUrl(): Promise<string | null> {
  if (!isTauri()) {
    return null;
  }
  try {
    const raw = await invoke<string | null>("get_db_url");
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  } catch (err) {
    console.warn("[config] Lecture de l'URL DB impossible", err);
    return null;
  }
}

export async function getConfigFilePath(): Promise<string | null> {
  if (!isTauri()) {
    return null;
  }
  try {
    const path = await invoke<string | null>("get_db_config_path");
    if (typeof path === "string" && path.trim()) {
      return path;
    }
    return null;
  } catch (err) {
    console.warn("[config] Impossible de récupérer le chemin config", err);
    return null;
  }
}

export async function saveDbUrl(url: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("Configuration disponible uniquement sous Tauri");
  }
  const trimmed = url?.trim();
  if (!trimmed) {
    throw new Error("URL SQLite invalide");
  }
  if (!/^sqlite:/i.test(trimmed)) {
    throw new Error("Seules les connexions sqlite:… sont supportées");
  }
  await invoke("set_db_url", { url: trimmed });
}

// src/lib/runtime.ts
import { isTauri } from "@/lib/db/sql";

export { isTauri };

const NOT_TAURI_HINT =
  "Vous êtes dans le navigateur de développement. Ouvrez la fenêtre Tauri pour activer SQLite.";

export function requireTauri(message?: string) {
  if (!isTauri) {
    console.warn(message || NOT_TAURI_HINT);
    return false;
  }
  return true;
}

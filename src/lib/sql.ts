import Database from "@tauri-apps/plugin-sql";

export const isTauri = !!import.meta.env.TAURI_PLATFORM;

export async function getDb() {
  if (!isTauri) {
    throw new Error("Tauri required: run via `npx tauri dev` to access SQLite");
  }
  return Database.load("sqlite:mamastock.db");
}

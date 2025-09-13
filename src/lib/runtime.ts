// src/lib/runtime.ts
export const isTauri =
  typeof window !== "undefined" &&
  typeof (window as any).__TAURI_IPC__ === "function";

export function requireTauri(message?: string) {
  if (!isTauri) {
    throw new Error(
      message || "Tauri required: run via `npx tauri dev` to access SQLite"
    );
  }
}

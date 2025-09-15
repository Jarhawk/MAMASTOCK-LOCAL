// src/lib/runtime.ts
import { isTauri } from "@/lib/db/sql";

export { isTauri };

export function requireTauri(message?: string) {
  if (!isTauri) {
    throw new Error(
      message || "Tauri required: open the native window"
    );
  }
}

// src/sw-guard.ts
import { isTauri } from "@/lib/runtime/isTauri";

// En contexte Tauri ou http non-sécurisé, on désenregistre tout SW présent
if (isTauri && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations?.()
    .then(list => {
      for (const r of list) r.unregister().catch(() => {});
    })
    .catch(() => {});
}

export const canRegisterSW =
  !isTauri &&
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  window.isSecureContext;

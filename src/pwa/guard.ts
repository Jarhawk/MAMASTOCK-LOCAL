import { isTauri } from "@/lib/db/sql";

export function setupPwaGuard() {
  if (isTauri) {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations?.()
        .then((regs) => {
          for (const reg of regs) {
            reg.unregister().catch(() => {});
          }
        })
        .catch(() => {});
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }
}

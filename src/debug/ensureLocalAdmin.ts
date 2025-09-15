// src/debug/ensureLocalAdmin.ts
import { registerLocal, LocalAccountEnv } from "@/auth/localAccount";import { isTauri } from "@/lib/db/sql";

const ADMIN_EMAIL = "admin@mamastock.local";
const ADMIN_PASS = "Admin123!";

export async function ensureLocalAdmin() {
  if (!LocalAccountEnv.isTauri) {
    console.info("[ensureLocalAdmin] skip (browser)");
    return;
  }
  try {
    await registerLocal(ADMIN_EMAIL, ADMIN_PASS);
    console.info("[ensureLocalAdmin] admin local créé.");
  } catch (e: any) {
    // si déjà créé → on ignore "Email déjà utilisé."
    if (String(e?.message || e).includes("Email déjà utilisé")) {
      console.info("[ensureLocalAdmin] admin local déjà présent.");
    } else {
      console.warn("[ensureLocalAdmin] impossible de créer l’admin local:", e);
    }
  }
}

(async () => {
  // en dev uniquement
  if (import.meta.env.DEV) {
    ensureLocalAdmin();
  }
})();
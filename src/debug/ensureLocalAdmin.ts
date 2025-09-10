// src/debug/ensureLocalAdmin.ts
import { registerLocal } from "@/auth/localAccount";

const ADMIN_EMAIL = "admin@mamastock.local";
const ADMIN_PASS  = "Admin123!";

export async function ensureLocalAdmin() {
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

import { isTauri } from "@/lib/tauriEnv";

export function can(rights = {}, module, action = "read", role = null) {
  if (role === "admin") return true;
  const mod = rights?.[module];
  if (!mod) return false;
  if (mod === true) return true;
  if (typeof mod !== "object") return false;

  if (mod[action] === true) return true;

  if (action === "lecture" && mod.peut_voir === true) return true;
  if (action === "peut_voir" && (mod.peut_voir === true || mod.lecture === true)) return true;
  if (action === "peut_modifier" && (mod.peut_modifier === true || mod.edition === true)) return true;
  if (action === "peut_creer" && (mod.peut_creer === true || mod.creation === true)) return true;
  if (action === "peut_supprimer" && (mod.peut_supprimer === true || mod.suppression === true)) return true;

  return !!mod[action];
}
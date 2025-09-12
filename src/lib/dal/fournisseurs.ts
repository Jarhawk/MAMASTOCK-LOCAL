import { select, get, run } from "@/lib/sql";
import type { Fournisseur } from "@/lib/types";

export async function listFournisseurs(): Promise<Fournisseur[]> {
  return select<Fournisseur>(
    "SELECT id, nom, email, actif FROM fournisseurs ORDER BY nom"
  );
}

export async function createFournisseur({ nom, email }: { nom: string; email?: string }) {
  return run(
    "INSERT INTO fournisseurs (nom, email, actif) VALUES (?,?,1)",
    [nom, email ?? null]
  );
}

export async function getFournisseur(id: number): Promise<Fournisseur | null> {
  return get<Fournisseur>(
    "SELECT id, nom, email, actif FROM fournisseurs WHERE id = ?",
    [id]
  );
}

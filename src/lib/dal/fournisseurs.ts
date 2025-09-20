// @ts-nocheck
import { getDb } from "@/lib/db/database";import { isTauri } from "@/lib/tauriEnv";
import type { Fournisseur } from "@/lib/types";

export async function listFournisseurs(): Promise<Fournisseur[]> {
  if (!isTauri()) return [];
  const db = await getDb();
  return db.select<Fournisseur[]>(
    "SELECT id, nom, email, actif FROM fournisseurs ORDER BY nom"
  );
}

export async function createFournisseur({ nom, email }: { nom: string; email?: string }) {
  if (!isTauri()) return;
  const db = await getDb();
  return db.execute(
    "INSERT INTO fournisseurs (nom, email, actif) VALUES (?,?,1)",
    [nom, email ?? null]
  );
}

export async function getFournisseur(id: number): Promise<Fournisseur | null> {
  if (!isTauri()) return null;
  const db = await getDb();
  const rows = await db.select<Fournisseur[]>(
    "SELECT id, nom, email, actif FROM fournisseurs WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}

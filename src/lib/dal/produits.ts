import { isTauri, getDb } from "@/lib/sql";
import type { Produit } from "@/lib/types";

export async function listProduits(actif?: boolean): Promise<Produit[]> {
  if (!isTauri) return [];
  const db = await getDb();
  if (actif == null)
    return db.select<Produit[]>("SELECT * FROM produits ORDER BY nom ASC");
  return db.select<Produit[]>(
    "SELECT * FROM produits WHERE actif = ? ORDER BY nom ASC",
    [actif ? 1 : 0]
  );
}

export async function getProduit(id: number): Promise<Produit | null> {
  if (!isTauri) return null;
  const db = await getDb();
  const rows = await db.select<Produit[]>(
    "SELECT * FROM produits WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}

export async function saveProduit(p: Partial<Produit> & { id?: number }) {
  if (!isTauri) return;
  const db = await getDb();
  if (p.id)
    return db.execute(
      "UPDATE produits SET nom=?, unite=?, actif=? WHERE id=?",
      [p.nom, p.unite, p.actif ? 1 : 0, p.id]
    );
  return db.execute(
    "INSERT INTO produits (nom, unite, actif) VALUES (?,?,?)",
    [p.nom, p.unite, p.actif ? 1 : 0]
  );
}

import { select, get, run } from "@/lib/sql";
import type { Produit } from "@/lib/types";

export async function listProduits(actif?: boolean): Promise<Produit[]> {
  if (actif == null)
    return select<Produit>("SELECT * FROM produits ORDER BY nom ASC");
  return select<Produit>(
    "SELECT * FROM produits WHERE actif = ? ORDER BY nom ASC",
    [actif ? 1 : 0]
  );
}

export async function getProduit(id: number): Promise<Produit | null> {
  return get<Produit>("SELECT * FROM produits WHERE id = ?", [id]);
}

export async function saveProduit(p: Partial<Produit> & { id?: number }) {
  if (p.id)
    return run(
      "UPDATE produits SET nom=?, unite=?, actif=? WHERE id=?",
      [p.nom, p.unite, p.actif ? 1 : 0, p.id]
    );
  return run(
    "INSERT INTO produits (nom, unite, actif) VALUES (?,?,?)",
    [p.nom, p.unite, p.actif ? 1 : 0]
  );
}

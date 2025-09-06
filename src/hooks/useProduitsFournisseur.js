// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { getDb } from '@/lib/db';

export function useProduitsFournisseur() {
  const [cache, setCache] = useState({});

  async function query(fournisseur_id) {
    const db = await getDb();
    return await db.select(
      `SELECT fl.produit_id, p.nom AS produit_nom,
              SUM(fl.quantite * fl.prix_unitaire) AS total_achat
         FROM factures f
         JOIN facture_lignes fl ON fl.facture_id = f.id
         JOIN produits p ON p.id = fl.produit_id
         WHERE f.fournisseur_id = ?
         GROUP BY fl.produit_id, p.nom`,
      [fournisseur_id]
    );
  }

  function useProduitsDuFournisseur(fournisseur_id) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function fetch() {
      if (!fournisseur_id) {
        setProducts([]);
        return [];
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await query(fournisseur_id);
        setProducts(rows);
        return rows;
      } catch (e) {
        setError(e);
        setProducts([]);
        return [];
      } finally {
        setLoading(false);
      }
    }

    return { products, loading, error, fetch };
  }

  const getProduitsDuFournisseur = useCallback(
    async (fournisseur_id) => {
      if (!fournisseur_id) return [];
      if (cache[fournisseur_id]) return cache[fournisseur_id];
      const rows = await query(fournisseur_id);
      setCache((c) => ({ ...c, [fournisseur_id]: rows }));
      return rows;
    },
    [cache]
  );

  const countProduitsDuFournisseur = useCallback(
    async (fournisseur_id) => {
      const rows = await getProduitsDuFournisseur(fournisseur_id);
      return rows.length;
    },
    [getProduitsDuFournisseur]
  );

  return {
    useProduitsDuFournisseur,
    getProduitsDuFournisseur,
    countProduitsDuFournisseur,
  };
}
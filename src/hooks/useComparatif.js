// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useEffect, useCallback } from "react";
import { comparatif_produit } from "@/lib/db";

import { useAuth } from '@/hooks/useAuth';

/**
 * Hook retournant le comparatif des prix par fournisseur pour un produit donné.
 * Calcule le dernier prix connu, le nombre d'achats et le prix moyen (PMP).
 */
export function useComparatif(productId) {
  const { mama_id } = useAuth();
  const [lignes, setLignes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComparatif = useCallback(async (id = productId) => {
    if (!id || !mama_id) {
      setLignes([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const data = await comparatif_produit(id);
      const grouped = {};
      for (const row of data || []) {
        const fid = row.fournisseur_id;
        const prix = parseFloat(row.prix_achat);
        if (!grouped[fid]) {
          grouped[fid] = {
            fournisseur: row.fournisseur_nom || "-",
            dernierPrix: prix,
            total: prix,
            nb: 1,
          };
        } else {
          grouped[fid].nb += 1;
          grouped[fid].total += prix;
        }
      }
      const lignesRes = Object.values(grouped).map((l) => ({
        fournisseur: l.fournisseur,
        dernierPrix: l.dernierPrix,
        nb: l.nb,
        pmp: l.total / l.nb,
      }));
      setLignes(lignesRes);
      return lignesRes;
    } catch (e) {
      setError(e);
      setLignes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id, productId]);

  useEffect(() => {
    if (productId && mama_id) {
      fetchComparatif(productId);
    } else {
      setLignes([]);
    }
  }, [productId, mama_id, fetchComparatif]);

  return { lignes, loading, error, fetchComparatif };
}
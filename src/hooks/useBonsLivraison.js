// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import {
  bonsLivraison_list,
  bonLivraison_get,
  bonLivraison_insert,
  bonLivraison_update } from
"@/local/bonsLivraison";

import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/runtime/isTauri";

export function useBonsLivraison() {
  const { mama_id } = useAuth();
  const [bons, setBons] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getBonsLivraison({
    fournisseur = "",
    debut = "",
    fin = "",
    actif = true,
    page = 1,
    pageSize = 50
  } = {}) {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const rows = await bonsLivraison_list({
        mama_id,
        fournisseur,
        debut,
        fin,
        actif
      });
      setTotal(rows.length);
      const start = (page - 1) * pageSize;
      const pageRows = rows.slice(start, start + pageSize);
      setBons(pageRows);
      return pageRows;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function fetchBonLivraisonById(id) {
    if (!id || !mama_id) return null;
    try {
      return await bonLivraison_get(mama_id, id);
    } catch (e) {
      setError(e);
      return null;
    }
  }

  async function insertBonLivraison(bl) {
    if (!mama_id) return { error: "no mama_id" };
    setLoading(true);
    setError(null);
    try {
      const id = await bonLivraison_insert({ ...bl, mama_id });
      return { data: { id } };
    } catch (e) {
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function updateBonLivraison(id, fields) {
    if (!mama_id) return { error: "no mama_id" };
    setLoading(true);
    setError(null);
    try {
      await bonLivraison_update(id, fields);
      return { data: { id } };
    } catch (e) {
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function toggleBonActif(id, actif) {
    return updateBonLivraison(id, { actif });
  }

  return {
    bons,
    total,
    loading,
    error,
    getBonsLivraison,
    fetchBonLivraisonById,
    insertBonLivraison,
    updateBonLivraison,
    toggleBonActif
  };
}

export default useBonsLivraison;
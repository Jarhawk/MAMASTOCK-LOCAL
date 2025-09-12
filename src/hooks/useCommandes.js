// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";

import { useAuth } from '@/hooks/useAuth';
import {
  commandes_list,
  commande_get,
  commande_insert,
  commande_update,
  commande_delete,
} from '@/local/commandes';

export function useCommandes() {
  const { mama_id, id: user_id } = useAuth();
  const [data, setData] = useState([]);
  const [current, setCurrent] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommandes = useCallback(
    async ({ fournisseur = "", statut = "", debut = "", fin = "", page = 1, limit = 20 } = {}) => {
      if (!mama_id) return { data: [], count: 0 };
      setLoading(true);
      setError(null);
      try {
        const { data, count } = await commandes_list({
          mama_id,
          fournisseur,
          statut,
          debut,
          fin,
          offset: (page - 1) * limit,
          limit,
        });
        setData(data);
        setCount(count);
        return { data, count };
      } catch (e) {
        console.error("❌ fetchCommandes", e);
        setError(e);
        setData([]);
        setCount(0);
        return { data: [], count: 0 };
      } finally {
        setLoading(false);
      }
    },
    [mama_id]
  );

  const fetchCommandeById = useCallback(
    async (id) => {
      if (!id || !mama_id) return { data: null, error: null };
      setLoading(true);
      setError(null);
      try {
        const data = await commande_get(mama_id, id);
        setCurrent(data);
        return { data, error: null };
      } catch (e) {
        console.error("❌ fetchCommandeById", e);
        setError(e);
        setCurrent(null);
        return { data: null, error: e };
      } finally {
        setLoading(false);
      }
    },
    [mama_id]
  );

  async function createCommande({ lignes = [], ...rest }) {
    if (!mama_id) return { error: "mama_id manquant" };
    setLoading(true);
    setError(null);
    try {
      const id = await commande_insert({ ...rest, mama_id, created_by: user_id, lignes });
      const data = await commande_get(mama_id, id);
      return { data };
    } catch (e) {
      console.error("❌ createCommande", e);
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function updateCommande(id, fields) {
    if (!mama_id) return { error: "mama_id manquant" };
    setLoading(true);
    setError(null);
    try {
      await commande_update(id, fields);
      const data = await commande_get(mama_id, id);
      return { data };
    } catch (e) {
      console.error("❌ updateCommande", e);
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function validateCommande(id) {
    return updateCommande(id, {
      statut: "validée",
      validated_by: user_id,
      envoyee_at: new Date().toISOString()
    });
  }

  async function deleteCommande(id) {
    if (!mama_id) return { error: "mama_id manquant" };
    setLoading(true);
    setError(null);
    try {
      await commande_delete(id);
      return { data: true };
    } catch (e) {
      console.error("❌ deleteCommande", e);
      setError(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    commandes: data,
    currentCommande: current,
    count,
    loading,
    error,
    fetchCommandes,
    fetchCommandeById,
    createCommande,
    updateCommande,
    validateCommande,
    deleteCommande
  };
}

export default useCommandes;
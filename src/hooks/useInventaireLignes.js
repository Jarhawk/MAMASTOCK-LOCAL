// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  inventaire_lignes_list,
  inventaire_ligne_add,
  inventaire_ligne_update,
  inventaire_ligne_delete,
} from '@/lib/db';

export function useInventaireLignes() {
  const { mama_id } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchLignes({ inventaireId } = {}) {
    if (!mama_id || !inventaireId) return { data: [], count: 0 };
    setLoading(true);
    setError(null);
    try {
      const data = await inventaire_lignes_list(inventaireId, mama_id);
      setLoading(false);
      return { data: data || [], count: (data || []).length };
    } catch (err) {
      setLoading(false);
      setError(err);
      return { data: [], count: 0 };
    }
  }

  async function createLigne({ inventaire_id, produit_id, quantite_reelle }) {
    if (!mama_id || !inventaire_id || !produit_id) {
      throw new Error('missing reference');
    }
    setLoading(true);
    setError(null);
    try {
      const id = await inventaire_ligne_add({ inventaire_id, produit_id, quantite_reelle, mama_id });
      setLoading(false);
      return { id, inventaire_id, produit_id, quantite_reelle };
    } catch (err) {
      setLoading(false);
      setError(err);
      return null;
    }
  }

  async function updateLigne(id, values) {
    if (!mama_id || !id) return null;
    setLoading(true);
    setError(null);
    try {
      const row = await inventaire_ligne_update(id, mama_id, values);
      setLoading(false);
      return row;
    } catch (err) {
      setLoading(false);
      setError(err);
      return null;
    }
  }

  async function deleteLigne(id) {
    if (!mama_id || !id) return;
    setLoading(true);
    setError(null);
    try {
      await inventaire_ligne_delete(id, mama_id);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { fetchLignes, createLigne, updateLigne, deleteLigne, loading, error };
}

export default useInventaireLignes;

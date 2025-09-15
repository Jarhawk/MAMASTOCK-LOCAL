// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useCallback, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  sous_familles_list,
  sous_familles_insert,
  sous_familles_update } from
"@/lib/db";import { isTauri } from "@/lib/db/sql";

export function useSousFamilles() {
  const { mama_id } = useAuth();
  const [sousFamilles, setSousFamilles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const list = useCallback(
    async ({ search = '', actif, familleId } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await sous_familles_list(mama_id, {
          search,
          actif,
          famille_id: familleId
        });
        setSousFamilles(data || []);
        setLoading(false);
        return { data: data || [], error: null };
      } catch (e) {
        setError(e);
        setLoading(false);
        return { data: [], error: e };
      }
    },
    [mama_id]
  );

  const create = useCallback(
    async ({ nom, famille_id }) => {
      const row = await sous_familles_insert({
        nom,
        famille_id,
        mama_id,
        actif: true
      });
      setSousFamilles((prev) => [row, ...prev]);
      return row;
    },
    [mama_id]
  );

  const toggleActif = useCallback(
    async (id, value) => {
      await sous_familles_update(id, mama_id, { actif: value ? 1 : 0 });
      setSousFamilles((prev) =>
      prev.map((s) => s.id === id ? { ...s, actif: value } : s)
      );
    },
    [mama_id]
  );

  return {
    sousFamilles: sousFamilles ?? [],
    items: sousFamilles ?? [],
    list,
    create,
    toggleActif,
    loading,
    isLoading: loading,
    error
  };
}

export async function fetchSousFamilles({ mamaId }) {
  try {
    return await sous_familles_list(mamaId);
  } catch (e) {
    console.warn('[sous_familles] fallback []', e);
    return [];
  }
}

export default useSousFamilles;
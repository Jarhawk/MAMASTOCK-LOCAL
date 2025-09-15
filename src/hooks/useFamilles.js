import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  familles_list,
  familles_insert,
  familles_update,
  familles_delete,
  familles_batch_delete } from
'@/lib/db';import { isTauri } from "@/lib/db/sql";

export async function fetchFamilles(mamaId) {
  const data = await familles_list(mamaId);
  return { data };
}

export function useFamilles() {
  const { mama_id } = useAuth();
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(false);

  const list = useCallback(async () => {
    if (!mama_id) return [];
    setLoading(true);
    const data = await familles_list(mama_id);
    setFamilles(data ?? []);
    setLoading(false);
    return data;
  }, [mama_id]);

  const addFamille = useCallback(
    async (values) => {
      if (!mama_id) return;
      await familles_insert({ ...values, mama_id });
      return list();
    },
    [mama_id, list]
  );

  const updateFamille = useCallback(
    async (id, values) => {
      if (!mama_id) return;
      await familles_update(id, mama_id, values);
      return list();
    },
    [mama_id, list]
  );

  const deleteFamille = useCallback(
    async (id) => {
      if (!mama_id) return;
      await familles_delete(id, mama_id);
      return list();
    },
    [mama_id, list]
  );

  const batchDeleteFamilles = useCallback(
    async (ids) => {
      if (!mama_id || !ids?.length) return;
      await familles_batch_delete(ids, mama_id);
      return list();
    },
    [mama_id, list]
  );

  useEffect(() => {
    list();
  }, [list]);

  return {
    familles,
    fetchFamilles: list,
    addFamille,
    updateFamille,
    deleteFamille,
    batchDeleteFamilles,
    loading
  };
}

export const fetchFamillesForValidation = fetchFamilles;

export default useFamilles;
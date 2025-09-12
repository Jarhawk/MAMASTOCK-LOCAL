// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ecarts_inventaire_list } from '@/lib/db';

export function useEcartsInventaire() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEcarts = useCallback(
    async (filters = {}) => {
      if (!mama_id) return [];
      setLoading(true);
      setError(null);
      try {
        const rows = await ecarts_inventaire_list(mama_id, filters);
        setData(Array.isArray(rows) ? rows : []);
        return rows || [];
      } catch (err) {
        setError(err);
        setData([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [mama_id]
  );

  return { data, loading, error, fetchEcarts };
}

export default useEcartsInventaire;

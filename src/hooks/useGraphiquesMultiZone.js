// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { zones_stock_list, inventaires_list } from '@/lib/db';import { isTauri } from "@/lib/db/sql";

export function useGraphiquesMultiZone() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchGraphiquesMultiZone() {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const zones = await zones_stock_list(mama_id, true);
      const inventaires = await inventaires_list(mama_id);
      const allData = zones.map((z) => ({
        zone: z.nom,
        points: inventaires.
        filter((i) => i.zone_id === z.id).
        sort((a, b) => a.date_inventaire.localeCompare(b.date_inventaire)).
        map((i) => ({ date: i.date_inventaire }))
      }));
      setData(allData);
      return allData;
    } catch (err) {
      setError(err);
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchGraphiquesMultiZone };
}

export default useGraphiquesMultiZone;
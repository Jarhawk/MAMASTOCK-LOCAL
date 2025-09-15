// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { performance_fiches_list } from '@/lib/db';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/db/sql";

export default function usePerformanceFiches() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData() {
    if (!mama_id) return [];
    setLoading(true);
    try {
      const rows = await performance_fiches_list(mama_id);
      setError(null);
      setData(Array.isArray(rows) ? rows : []);
      return rows || [];
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchData };
}
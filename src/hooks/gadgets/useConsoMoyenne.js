import { useState, useEffect, useCallback } from 'react';
import { requisitions_quantites_since } from "@/lib/db";

import { useAuth } from '@/hooks/useAuth';

export async function fetchConsoMoyenne(mamaId, sinceISO) {
  return await requisitions_quantites_since(mamaId, sinceISO);
}

export default function useConsoMoyenne() {
  const { mama_id } = useAuth();
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!mama_id) return 0;
    setLoading(true);
    setError(null);
    try {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      const data = await fetchConsoMoyenne(mama_id, start.toISOString());

      const daily = {};
      (data || []).forEach((m) => {
        const d = m.date_requisition?.slice(0, 10);
        if (!daily[d]) daily[d] = 0;
        daily[d] += Number(m.quantite || 0);
      });
      const values = Object.values(daily);
      const avgValue = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      setAvg(avgValue);
      if (import.meta.env.DEV) {
        console.debug('Chargement dashboard terminé');
      }
      return avgValue;
    } catch (e) {
      console.warn('useConsoMoyenne', e);
      setError(e);
      setAvg(0);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { avg, loading, error, refresh: fetchData };
}
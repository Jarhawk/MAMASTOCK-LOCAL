import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDb, isTauri } from '@/lib/db/sql';

export default function useProduitsUtilises() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
      async (signal) => {
        if (!isTauri) {
          console.info('useProduitsUtilises: ignoré hors Tauri');
          return [];
        }
        if (!mama_id) return [];
        setLoading(true);
        setError(null);
      const start = new Date();
      start.setDate(start.getDate() - 30);
      try {
        const db = await getDb();
        const rows = await db.select(
          `SELECT produit_id, produit_nom, quantite, date_utilisation
           FROM v_produits_utilises
           WHERE mama_id = ? AND date_utilisation >= ?`,
          [mama_id, start.toISOString().slice(0, 10)]
        );
        const totals = {};
        (rows || []).forEach((r) => {
          const id = r.produit_id;
          if (!totals[id]) {
            totals[id] = { id, nom: r.produit_nom, total: 0 };
          }
          totals[id].total += Number(r.quantite || 0);
        });
        const list = Object.values(totals)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setData(list);
        setLoading(false);
        return list;
      } catch (err) {
        setError(err);
        setData([]);
        setLoading(false);
        return [];
      }
    },
    [mama_id]
  );

    useEffect(() => {
      const controller = new AbortController();
      fetchData(controller.signal);
      return () => controller.abort();
    }, [fetchData]);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    return fetchData(controller.signal);
  }, [fetchData]);

  return { data, loading, error, refresh };
}

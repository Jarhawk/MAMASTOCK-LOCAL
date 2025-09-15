import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/runtime/isTauri";

export default function useTachesUrgentes() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
      async (signal) => {
        if (!isTauri) {
          console.info('useTachesUrgentes: ignoré hors Tauri');
          return [];
        }
        if (!mama_id) return [];
        setLoading(true);
        setError(null);
      const today = new Date();
      const limitDate = new Date();
      limitDate.setDate(today.getDate() + 7);
      try {
        const db = await getDb();
        const rows = await db.select(
          `SELECT id, titre, date_echeance FROM taches
           WHERE mama_id = ? AND actif = 1 AND statut != 'terminee'
             AND date_echeance >= ? AND date_echeance <= ?
           ORDER BY date_echeance ASC LIMIT 5`,
          [
            mama_id,
            today.toISOString().slice(0, 10),
            limitDate.toISOString().slice(0, 10),
          ]
        );
        setData(rows ?? []);
        setLoading(false);
        return rows ?? [];
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

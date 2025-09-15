import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/runtime/isTauri";

export default function useDerniersAcces() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
      async (signal) => {
        if (!isTauri) {
          console.info('useDerniersAcces: ignoré hors Tauri');
          return [];
        }
        if (!mama_id) return [];
        setLoading(true);
        setError(null);
      try {
        const db = await getDb();
        const rows = await db.select(
          `SELECT utilisateur_id, created_at, email
           FROM logs_securite
           WHERE mama_id = ?
           ORDER BY created_at DESC
           LIMIT 50`,
          [mama_id]
        );
        const seen = {};
        const list = [];
        for (const row of rows || []) {
          if (!row.utilisateur_id || seen[row.utilisateur_id]) continue;
          seen[row.utilisateur_id] = true;
          list.push({ id: row.utilisateur_id, email: row.email, date: row.created_at });
          if (list.length >= 5) break;
        }
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

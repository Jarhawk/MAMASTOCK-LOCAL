import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createAsyncState } from '@/hooks/_shared/createAsyncState';
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/tauriEnv";

export default function useEvolutionAchats() {
  const { mama_id, loading: authLoading } = useAuth() || {};
  const [state, setState] = useState(() => createAsyncState([]));

  const fetchData = useCallback(
      async (signal) => {
        if (!isTauri()) {
          console.info('useEvolutionAchats: ignoré hors Tauri');
          return [];
        }
        if (!mama_id) return [];
        setState((s) => ({ ...s, loading: true, error: null }));
      const start = new Date();
      start.setMonth(start.getMonth() - 12);
      const filterDate = start.toISOString().slice(0, 10);
      try {
        const db = await getDb();
        const rows = await db.select(
          `SELECT mois, montant FROM v_evolution_achats
           WHERE mama_id = ? AND mois >= ?
           ORDER BY mois ASC`,
          [mama_id, filterDate]
        );
        setState({ data: rows ?? [], loading: false, error: null });
        return rows ?? [];
      } catch (error) {
        setState({ data: [], loading: false, error });
        return [];
      }
    },
    [mama_id]
  );

    useEffect(() => {
      if (authLoading) return;
      const controller = new AbortController();
      fetchData(controller.signal);
      return () => controller.abort();
    }, [authLoading, fetchData]);

  const loading = authLoading || state.loading;
  return { data: state.data, loading, error: state.error };
}

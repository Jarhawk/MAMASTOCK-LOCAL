import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDb, isTauri } from '@/lib/db/sql';

/**
 * Hook for low stock alerts based on v_alertes_rupture_api view.
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=20]
 */
export function useAlerteStockFaible({ page = 1, pageSize = 20 } = {}) {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
      async (signal) => {
        if (!isTauri) {
          console.info('useAlerteStockFaible: ignoré hors Tauri');
          return [];
        }
        if (!mama_id) return [];
        setLoading(true);
        setError(null);
        const offset = (page - 1) * pageSize;
        const db = await getDb();
        try {
          const rows = await db.select(
            `SELECT produit_id as id, produit_id, nom, unite, fournisseur_id, fournisseur_nom, stock_actuel, stock_min, manque, consommation_prevue, receptions, stock_projete
             FROM v_alertes_rupture_api
             ORDER BY manque DESC
             LIMIT ? OFFSET ?`,
            [pageSize, offset]
          );
          setData(rows ?? []);
          setTotal(rows?.length ?? 0);
          setLoading(false);
          return rows ?? [];
        } catch (err) {
          setData([]);
          setTotal(0);
          setError(err);
          setLoading(false);
          return [];
        }
      },
      [mama_id, page, pageSize]
    );

    useEffect(() => {
      if (!mama_id || !isTauri) return;
      const controller = new AbortController();
      fetchData(controller.signal);
      return () => controller.abort();
    }, [mama_id, fetchData]);

  return { data, total, page, pageSize, loading, error };
}
export default useAlerteStockFaible;

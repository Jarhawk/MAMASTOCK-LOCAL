import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDb, isTauri } from '@/lib/db/sql';

export default function useAlerteStockFaible() {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
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
      try {
        const db = await getDb();
        const rows = await db.select(
          `SELECT produit_id, nom, unite, fournisseur_nom, stock_actuel, stock_min
           FROM v_alertes_rupture_api
           ORDER BY manque DESC LIMIT 50`
        );
        const list = (rows ?? [])
          .map((p) => ({
            produit_id: p.produit_id,
            nom: p.nom,
            stock_actuel: p.stock_actuel,
            stock_min: p.stock_min,
            unite: p.unite,
            fournisseur_nom: p.fournisseur_nom,
          }))
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

// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import {
  produits_list,
  inventaires_list,
  inventaire_create,
} from '@/lib/db';
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/runtime/isTauri";

export function useStock() {
  const { mama_id } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    const fetchStocks = useCallback(async () => {
      if (!isTauri) {
        console.info('useStock: ignoré hors Tauri');
        setStocks([]);
        return [];
      }
      setLoading(true);
      setError(null);
      try {
        const data = await produits_list('', false, 1, 1000);
        setStocks(data || []);
        return data || [];
      } catch (err) {
        setError(err);
        setStocks([]);
        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  async function fetchRotationStats() {
    return [];
  }

    const getStockTheorique = useCallback(async (produit_id) => {
      if (!isTauri) {
        console.info('useStock: ignoré hors Tauri');
        return 0;
      }
      if (!produit_id) return 0;
      const db = await getDb();
      const rows = await db.select(
        'SELECT stock_theorique FROM produits WHERE id = ?',
        [produit_id]
      );
      return rows[0]?.stock_theorique ?? 0;
    }, []);

    const getInventaires = useCallback(async () => {
      if (!isTauri) {
        console.info('useStock: ignoré hors Tauri');
        return [];
      }
      if (!mama_id) return [];
      return await inventaires_list(mama_id);
    }, [mama_id]);

  const createInventaire = useCallback(
      async (payload) => {
        if (!isTauri) {
          console.info('useStock: ignoré hors Tauri');
          return null;
        }
        if (!mama_id) return null;
        return await inventaire_create({ ...payload, mama_id });
      },
      [mama_id]
    );

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    fetchRotationStats,
    getStockTheorique,
    getInventaires,
    createInventaire,
  };
}

export default useStock;

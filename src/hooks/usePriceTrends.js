// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { price_trends_list } from '@/lib/db';

export function usePriceTrends(productIdInitial) {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchTrends(prodId = productIdInitial) {
    if (!prodId) return [];
    setLoading(true);
    const rows = await price_trends_list(mama_id, prodId);
    setLoading(false);
    setData(Array.isArray(rows) ? rows : []);
    return rows || [];
  }

  return { data, loading, fetchTrends };
}
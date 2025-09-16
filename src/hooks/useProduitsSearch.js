// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useQuery } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';

import { getQueryClient } from '@/lib/react-query';
import { produits_list } from '@/lib/db';import { isTauri } from "@/lib/tauriEnv";

function normalize(list = []) {
  return list.map((p) => ({
    id: p.id ?? p.produit_id ?? null,
    nom: p.nom ?? null,
    // unite_id est nécessaire pour hydrater l'unité dans les formulaires
    unite_id: p.unite_id ?? null,
    tva: p.tva ?? null,
    zone_id: p.zone_stock_id ?? null
  }));
}

export function useProduitsSearch(
term = '',
_mamaIdParam,
{ enabled = true, debounce = 300, page = 1, pageSize = 20 } = {})
{
  const debounced = useDebounce(term, debounce);

  const query = useQuery({
    queryKey: ['produits-search', debounced, page, pageSize],
    enabled: enabled && debounced.trim().length >= 2,
    queryFn: async () => {
      const q = debounced.trim();
      if (q.length < 2) return { rows: [], total: 0 };
      console.debug('[useProduitsSearch] search produits', { q, page });
      try {
        const { rows, total } = await produits_list(q, true, page, pageSize);
        return { rows: normalize(rows), total };
      } catch (err) {
        console.warn('[useProduitsSearch] produits query failed', err);
        return { rows: [], total: 0 };
      }
    }
  }, getQueryClient());

  return {
    data: query.data?.rows || [],
    total: query.data?.total || 0,
    page,
    pageSize,
    isLoading: query.isLoading,
    error: query.error
  };
}

export default useProduitsSearch;
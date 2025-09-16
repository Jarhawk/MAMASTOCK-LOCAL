// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
// fix: avoid ilike.%% on empty search.
import { useQuery } from '@tanstack/react-query';
import { fournisseurs_list } from '@/lib/db';import { isTauri } from "@/lib/tauriEnv";

function normalizeSearchTerm(q = '') {
  return q.trim();
}

export function useFournisseurs(params = {}) {
  const {
    search = '',
    actif = true,
    page = 1,
    limit = 50
  } = params;

  const term = normalizeSearchTerm(search);
  const filtre = { search: term, actif, page, limit };

  return useQuery({
    queryKey: ['fournisseurs', filtre],
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const rows = await fournisseurs_list();
      return { data: rows, count: rows.length };
    }
  });
}

export default useFournisseurs;
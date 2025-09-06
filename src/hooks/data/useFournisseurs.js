// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
// fix: avoid ilike.%% on empty search.
import { useQuery } from '@tanstack/react-query';
import { normalizeSearchTerm } from '@/lib/supa/textSearch';
import { fournisseurs_list } from '@/lib/db';


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
      const { rows, total } = await fournisseurs_list(term, limit, page);
      return { data: rows, count: total };
    },
  });
}

export default useFournisseurs;

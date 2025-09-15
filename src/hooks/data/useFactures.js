import { factures_list } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";import { isTauri } from "@/lib/db/sql";

export function useFactures(filters = {}) {
  const { page = 1, pageSize = 20, search = "", fournisseur, statut } = filters;
  return useQuery({
    queryKey: ["factures", filters],
    queryFn: async () => {
      const { factures, total } = await factures_list({
        search,
        fournisseur_id: fournisseur?.id,
        statut,
        page,
        pageSize
      });
      return { factures, total };
    }
  });
}

export default useFactures;
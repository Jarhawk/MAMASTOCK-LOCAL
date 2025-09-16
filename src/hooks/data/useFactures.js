import { factures_list } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";import { isTauri } from "@/lib/tauriEnv";

export function useFactures(filters = {}) {
  const { page = 1, pageSize = 20, search = "", fournisseur, statut } = filters;
  const tauri = isTauri();
  if (!tauri) {
    console.info("useFactures(data): ignoré hors Tauri");
  }
  return useQuery({
    queryKey: ["factures", filters],
    enabled: tauri,
    initialData: { factures: [], total: 0 },
    queryFn: async () => {
      if (!isTauri()) {
        return { factures: [], total: 0 };
      }
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
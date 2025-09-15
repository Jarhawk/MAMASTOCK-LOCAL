import { useQuery } from '@tanstack/react-query';
import { zones_stock_list } from '@/lib/db';import { isTauri } from "@/lib/runtime/isTauri";

export function useZonesStock(mamaId, { onlyActive = true } = {}) {
  return useQuery({
    queryKey: ['inventaire_zones', mamaId, onlyActive],
    queryFn: async () => {
      if (!mamaId) return [];
      return await zones_stock_list(mamaId, onlyActive);
    },
    initialData: []
  });
}

export async function fetchZonesStock(mamaId, { onlyActive = true } = {}) {
  if (!mamaId) return [];
  return await zones_stock_list(mamaId, onlyActive);
}

export default useZonesStock;
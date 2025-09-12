import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { budgetMensuelGet } from '@/local/budget';

export default function useBudgetMensuel() {
  const { mama_id } = useAuth();

  const periode = new Date().toISOString().slice(0, 7);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['budgetMensuel', mama_id, periode],
    queryFn: async () => {
      if (!mama_id) return { cible: 0, reel: 0 };
      return await budgetMensuelGet(periode);
    },
    staleTime: 1000 * 60 * 5
  });

  return { ...(data || { cible: 0, reel: 0 }), loading: isLoading, error, refresh: refetch };
}
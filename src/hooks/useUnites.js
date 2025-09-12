import { useQuery } from '@tanstack/react-query';
import { unites_list } from '@/lib/db';

export async function fetchUnites(mamaId) {
  return await unites_list(mamaId);
}

export function useUnites(mamaId) {
  return useQuery({
    queryKey: ['unites', mamaId],
    queryFn: () => unites_list(mamaId),
    initialData: [],
  });
}

export const fetchUnitesForValidation = fetchUnites;

export default useUnites;


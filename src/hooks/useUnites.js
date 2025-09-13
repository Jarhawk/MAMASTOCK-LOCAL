import { useQuery } from '@tanstack/react-query';
import { unites_list } from '@/lib/db';

export async function listUnites(mamaId) {
  return await unites_list(mamaId);
}

export function useUnites(mamaId) {
  return useQuery({
    queryKey: ['unites', mamaId],
    queryFn: () => unites_list(mamaId),
    initialData: [],
  });
}

export const listUnitesForValidation = listUnites;

export default useUnites;


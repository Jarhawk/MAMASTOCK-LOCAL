import { useQuery } from '@tanstack/react-query';
import { unites_list } from '@/lib/db';import { isTauri } from "@/lib/runtime/isTauri";

export async function listUnites(mamaId) {
  return await unites_list(mamaId);
}

export function useUnites(mamaId) {
  return useQuery({
    queryKey: ['unites', mamaId],
    queryFn: () => unites_list(mamaId),
    initialData: []
  });
}

export const listUnitesForValidation = listUnites;

export default useUnites;
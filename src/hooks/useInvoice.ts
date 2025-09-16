import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { facture_get } from '@/lib/db';import { isTauri } from "@/lib/tauriEnv";

export type FactureLigne = {
  id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number | null;
};

export type Facture = {
  id: number;
  fournisseur_id: number | null;
  date_iso: string;
  lignes?: FactureLigne[];
};

export function useInvoice(id: number | string | undefined): UseQueryResult<Facture | null> {
  return useQuery<Facture | null>({
    queryKey: ['invoice', id],
    enabled: !!id && id !== 'new',
    queryFn: async () => {
      if (!id || id === 'new') return null;
      return await facture_get(id);
    },
    staleTime: 0,
    refetchOnWindowFocus: false
  });
}
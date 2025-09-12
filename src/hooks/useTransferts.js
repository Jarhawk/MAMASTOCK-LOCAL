// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";

import { useAuth } from '@/hooks/useAuth';
import usePeriodes from '@/hooks/usePeriodes';
import {
  transferts_list,
  transfert_create,
  transfert_get,
} from "@/local/transferts";

export function useTransferts() {
  const { mama_id, user_id } = useAuth();
  const { checkCurrentPeriode } = usePeriodes();
  const [transferts, setTransferts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransferts = useCallback(
    async (
    {
      debut = "",
      fin = "",
      zone_source_id = "",
      zone_dest_id = "",
      produit_id = ""
    } = {}) =>
    {
      if (!mama_id) return [];
      setLoading(true);
      setError(null);
      try {
        const data = await transferts_list({
          mama_id,
          debut,
          fin,
          zone_source_id,
          zone_dest_id,
          produit_id,
        });
        setTransferts(data);
        return data;
      } catch (err) {
        setError(err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [mama_id]
  );

  async function createTransfert(header, lignes = []) {
    if (!mama_id) return { error: "no mama_id" };
    const date = header.date_transfert || new Date().toISOString();
    const { error: pErr } = await checkCurrentPeriode(date);
    if (pErr) return { error: pErr };
    setLoading(true);
    setError(null);
    try {
      const tr = await transfert_create(
        {
          mama_id,
          zone_source_id: header.zone_source_id,
          zone_dest_id: header.zone_dest_id,
          motif: header.motif || "",
          date_transfert: date,
          utilisateur_id: user_id,
          commentaire: header.commentaire || "",
        },
        lignes
      );
      setTransferts((t) => [tr, ...t]);
      return { data: tr };
    } catch (err) {
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }

  const getTransfertById = useCallback(
    async (id) => {
      if (!mama_id || !id) return null;
      setLoading(true);
      setError(null);
      try {
        return await transfert_get(id, mama_id);
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mama_id]
  );

  return {
    transferts,
    loading,
    error,
    fetchTransferts,
    createTransfert,
    getTransfertById
  };
}

export default useTransferts;

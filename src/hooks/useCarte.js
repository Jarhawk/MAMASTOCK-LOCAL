// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";

import { useAuth } from '@/hooks/useAuth';
import { carte_list, fiches_update } from '@/lib/db';import { isTauri } from "@/lib/runtime/isTauri";

export function useCarte() {
  const { mama_id } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCarte = useCallback(
    async (type) => {
      if (!mama_id) return [];
      setLoading(true);
      setError(null);
      try {
        const rows = await carte_list(mama_id, type);
        setLoading(false);
        return Array.isArray(rows) ? rows : [];
      } catch (err) {
        setError(err);
        setLoading(false);
        return [];
      }
    },
    [mama_id]
  );

  const updatePrixVente = useCallback(
    async (id, prix_vente) => {
      if (!mama_id) return;
      await fiches_update(id, mama_id, { prix_vente });
    },
    [mama_id]
  );

  const toggleCarte = useCallback(
    async (id, active, extra = {}) => {
      if (!mama_id) return;
      await fiches_update(id, mama_id, { carte_actuelle: active, ...extra });
    },
    [mama_id]
  );

  return { loading, error, fetchCarte, updatePrixVente, toggleCarte };
}
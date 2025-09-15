// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useCallback, useEffect, useState } from "react";
import {
  listFournisseurs,
  createFournisseur as dalCreateFournisseur } from
"@/lib/dal/fournisseurs";import { isTauri } from "@/lib/db/sql";

export function useFournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFournisseurs = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listFournisseurs();
      setFournisseurs(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchFournisseurs();
  }, [fetchFournisseurs]);

  const createFournisseur = useCallback(
    async (f) => {
      await dalCreateFournisseur(f);
      await fetchFournisseurs();
      return { error: null };
    },
    [fetchFournisseurs]
  );

  return {
    fournisseurs,
    loading,
    error,
    fetchFournisseurs,
    createFournisseur
  };
}

export default useFournisseurs;
// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";

import { useAuth } from '@/hooks/useAuth';
import { produits_autocomplete } from "@/lib/db";import { isTauri } from "@/lib/db/sql";

export function useProduitsAutocomplete() {
  const { mama_id } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchProduits = useCallback(async (query = "") => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const final = await produits_autocomplete(query, mama_id);
      setResults(final);
      return final;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  return { results, loading, error, searchProduits };
}
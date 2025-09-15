// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { fiches_autocomplete } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/db/sql";

export function useFichesAutocomplete() {
  const { mama_id } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFiches = useCallback(async ({ query = "", excludeId } = {}) => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const rows = await fiches_autocomplete({ query, excludeId });
      setResults(Array.isArray(rows) ? rows : []);
      return rows || [];
    } catch (error) {
      setError(error);
      setResults([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  return { results, loading, error, searchFiches };
}
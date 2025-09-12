import { useState, useCallback } from "react";
import { factures_list } from "@/lib/db";

export function useFacturesAutocomplete() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFactures = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const { factures } = await factures_list({ search: query, pageSize: 10 });
      setResults(Array.isArray(factures) ? factures : []);
      return factures || [];
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, searchFactures };
}
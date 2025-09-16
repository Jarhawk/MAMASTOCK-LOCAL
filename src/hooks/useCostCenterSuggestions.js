// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { readCostCenters } from "@/local/costCenters";import { isTauri } from "@/lib/tauriEnv";


export function useCostCenterSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchSuggestions(produit_id) {
    if (!produit_id) {
      setSuggestions([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const centres = await readCostCenters();
      const actifs = centres.filter((c) => c.actif);
      setSuggestions(actifs);
      return actifs;
    } catch (err) {
      setError(err);
      setSuggestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return { suggestions, loading, error, fetchSuggestions };
}
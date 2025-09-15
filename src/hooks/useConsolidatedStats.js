// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { consolidation_performance } from "@/lib/db";import { isTauri } from "@/lib/db/sql";


export function useConsolidatedStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchStats() {
    setLoading(true);
    try {
      const end = new Date().toISOString().slice(0, 10);
      const data = await consolidation_performance({ start: "2000-01-01", end });
      const mapped = (data || []).map((r) => ({
        mama_id: r.mama_id,
        nom: r.mama_id,
        stock_valorise: r.valeur_stock || 0,
        conso_mois: r.total_achats || 0,
        nb_mouvements: 0
      }));
      setStats(mapped);
      setError(null);
      return mapped;
    } catch (e) {
      console.error("Erreur consolidated_stats:", e);
      setError(e.message || e);
      setStats([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return { stats, loading, error, fetchStats };
}
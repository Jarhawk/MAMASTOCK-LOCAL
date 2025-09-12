// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useRef, useEffect, useCallback } from "react";
import { readText, existsFile } from "@/local/files";

import { useAuth } from '@/hooks/useAuth';

/**
 * options: {
 *   auto: boolean (par défaut false)
 *   interval: nombre de ms pour le refresh auto (ex: 30000)
 *   retry: nombre d’essais max (ex: 2)
 *   page: numéro de page (1 par défaut)
 *   pageSize: nombre de lignes par page (défaut 30)
 *   params: params SQL additionnels pour la fonction (objet)
 * }
 */
export function useDashboardStats(options = {}) {
  const { mama_id, loading: authLoading } = useAuth();
  const {
    auto = false,
    interval = 30000,
    page = 1,
    pageSize = 30,
  } = options;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalId = useRef(null);

  const fetchStats = useCallback(async () => {
    if (!mama_id || authLoading) return;
    setLoading(true);
    setError(null);
    try {
      if (await existsFile("stats/dashboard_stats.json")) {
        const txt = await readText("stats/dashboard_stats.json");
        const json = JSON.parse(txt);
        setStats(json);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error("Erreur dashboard_stats:", err);
      setError(err?.message || "Erreur récupération stats dashboard.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [mama_id, authLoading]);

  useEffect(() => {
    if (!auto) return;
    if (!mama_id || authLoading) return;
    fetchStats();
    intervalId.current = setInterval(fetchStats, interval);
    return () => clearInterval(intervalId.current);
  }, [auto, interval, fetchStats, mama_id, authLoading]);

  useEffect(() => {
    if (auto) return;
    if (!mama_id || authLoading) return;
    fetchStats();
  }, [page, pageSize, mama_id, authLoading, auto, fetchStats]);

  useEffect(() => {
    if (!mama_id && !authLoading) setStats(null);
  }, [mama_id, authLoading]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    refresh: fetchStats,
    setPage: () => fetchStats(),
    setPageSize: () => fetchStats(),
  };
}
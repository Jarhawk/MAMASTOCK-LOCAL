// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { fiche_cout_history_list } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/tauriEnv";

export function useFicheCoutHistory() {
  const { mama_id } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchFicheCoutHistory(fiche_id) {
    if (!fiche_id || !mama_id) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fiche_cout_history_list(fiche_id);
      setHistory(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err.message || "Erreur chargement historique coût fiche.");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  return { history, loading, error, fetchFicheCoutHistory };
}
// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useAuth } from '@/hooks/useAuth';
import { stats_cost_centers_list } from '@/lib/db';import { isTauri } from "@/lib/tauriEnv";

export function useCostCenterMonthlyStats() {
  const { mama_id } = useAuth();

  async function fetchMonthly({ debut = null, fin = null } = {}) {
    if (!mama_id) return [];
    try {
      return await stats_cost_centers_list(mama_id, { debut, fin });
    } catch (e) {
      console.error('Erreur fetchMonthly:', e);
      return [];
    }
  }

  return { fetchMonthly };
}
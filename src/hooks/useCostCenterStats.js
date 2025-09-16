// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { stats_cost_centers_list } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/tauriEnv";

export function useCostCenterStats() {
  const { mama_id } = useAuth();

  async function fetchStats({ debut = null, fin = null } = {}) {
    if (!mama_id) return [];
    try {
      return await stats_cost_centers_list(mama_id, { debut, fin });
    } catch (error) {
      console.error('Erreur stats_cost_centers:', error);
      return [];
    }
  }

  return { fetchStats };
}
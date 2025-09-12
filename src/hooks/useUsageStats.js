// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useAuth } from '@/hooks/useAuth';
import {
  usage_stats_module_counts,
  usage_stats_last_seen,
  logs_securite_frequent_errors,
} from "@/lib/db";

export function useUsageStats() {
  const { mama_id } = useAuth();

  async function getModuleUsageCount() {
    if (!mama_id) return [];
    return await usage_stats_module_counts(mama_id);
  }

  async function getLastSeen(user_id) {
    if (!mama_id || !user_id) return null;
    return await usage_stats_last_seen(mama_id, user_id);
  }

  async function getFrequentErrors() {
    if (!mama_id) return [];
    return await logs_securite_frequent_errors(mama_id);
  }

  return { getModuleUsageCount, getLastSeen, getFrequentErrors };
}
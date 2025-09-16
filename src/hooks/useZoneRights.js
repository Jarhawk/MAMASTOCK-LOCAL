// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { zones_droits_list, zones_droits_upsert, zones_droits_delete } from "@/lib/db";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/tauriEnv";

export function useZoneRights() {
  const { mama_id } = useAuth();

  async function fetchZoneRights(zone_id) {
    try {
      return await zones_droits_list(zone_id, mama_id);
    } catch (e) {
      toast.error(String(e));
      return [];
    }
  }

  async function setUserRights({ zone_id, user_id, lecture, ecriture, transfert, requisition }) {
    try {
      await zones_droits_upsert({ zone_id, user_id, lecture, ecriture, transfert, requisition, mama_id });
      return { error: null };
    } catch (e) {
      toast.error(String(e));
      return { error: e };
    }
  }

  async function removeUserRights(id) {
    try {
      await zones_droits_delete(id);
      return { error: null };
    } catch (e) {
      toast.error(String(e));
      return { error: e };
    }
  }

  return { fetchZoneRights, setUserRights, removeUserRights };
}
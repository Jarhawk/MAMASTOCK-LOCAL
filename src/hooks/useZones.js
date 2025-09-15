// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import {
  zones_list,
  zone_get,
  zone_create,
  zone_update,
  zone_delete,
  zones_reorder,
  zones_accessible } from
"@/lib/db";
import { toast } from "sonner";
import { useState } from "react";import { isTauri } from "@/lib/runtime/isTauri";

export default function useZones() {
  const [zones, setZones] = useState([]);

  async function fetchZones(params = {}) {
    try {
      const rows = await zones_list(params);
      const cleaned = (rows || []).map((z) => ({
        ...z,
        position: Number.isFinite(z.position) ? z.position : 0
      }));
      cleaned.sort(
        (a, b) => a.position - b.position || a.nom.localeCompare(b.nom)
      );
      setZones(cleaned);
      return cleaned;
    } catch (e) {
      toast.error(String(e));
      return [];
    }
  }

  async function fetchZoneById(id) {
    try {
      const z = await zone_get(id);
      if (!z) return null;
      return {
        ...z,
        position: Number.isFinite(z.position) ? z.position : 0
      };
    } catch (e) {
      toast.error(String(e));
      return null;
    }
  }

  async function createZone(payload) {
    try {
      await zone_create(payload);
      return { error: null };
    } catch (e) {
      toast.error(String(e));
      return { error: e };
    }
  }

  async function updateZone(id, payload) {
    try {
      await zone_update(id, payload);
      return { error: null };
    } catch (e) {
      toast.error(String(e));
      return { error: e };
    }
  }

  async function deleteZone(id) {
    try {
      await zone_delete(id);
      return { error: null };
    } catch (e) {
      toast.error(String(e));
      return { error: e };
    }
  }

  async function reorderZones(list) {
    try {
      const updates = list.map((z, idx) => ({ id: z.id, position: idx }));
      await zones_reorder(updates);
      return { error: null };
    } catch (e) {
      toast.error(String(e));
      return { error: e };
    }
  }

  async function myAccessibleZones({ mode } = {}) {
    try {
      return await zones_accessible({ mode });
    } catch (e) {
      toast.error(String(e));
      return [];
    }
  }

  return {
    zones,
    fetchZones,
    fetchZoneById,
    createZone,
    updateZone,
    deleteZone,
    reorderZones,
    myAccessibleZones
  };
}

export { useZones };
// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useAuth } from "@/hooks/useAuth";
import {
  zone_products_list,
  zone_products_move,
  zone_products_copy,
  zone_products_merge } from
"@/lib/db";import { isTauri } from "@/lib/runtime/isTauri";

export function useZoneProducts() {
  const { mama_id } = useAuth();

  async function list(zoneId) {
    return await zone_products_list(zoneId, mama_id);
  }

  async function move(srcZoneId, dstZoneId, removeSrc) {
    return await zone_products_move(mama_id, srcZoneId, dstZoneId, removeSrc);
  }

  async function copy(srcZoneId, dstZoneId, overwrite) {
    return await zone_products_copy(mama_id, srcZoneId, dstZoneId, overwrite);
  }

  async function merge(srcZoneId, dstZoneId) {
    return await zone_products_merge(mama_id, srcZoneId, dstZoneId);
  }

  return { list, move, copy, merge };
}
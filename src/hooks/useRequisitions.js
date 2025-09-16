// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useAuth } from '@/hooks/useAuth';
import {
  requisitions_list,
  requisition_get,
  requisition_create,
  requisition_update,
  requisition_delete } from
"@/local/requisitions";import { isTauri } from "@/lib/tauriEnv";

export function useRequisitions() {
  const { mama_id } = useAuth();

  async function fetchRequisitions({ search = "", page = 1, limit = 20 } = {}) {
    if (!mama_id) return { data: [], count: 0 };
    const { data, count } = await requisitions_list({
      mama_id,
      search,
      page,
      limit
    });
    return { data, count };
  }

  async function getRequisitions({
    zone = "",
    statut = "",
    debut = "",
    fin = "",
    produit = "",
    page = 1,
    limit = 10
  } = {}) {
    if (!mama_id) return { data: [], count: 0 };
    return await requisitions_list({
      mama_id,
      zone,
      statut,
      debut,
      fin,
      produit,
      page,
      limit
    });
  }

  async function getRequisitionById(id) {
    if (!id || !mama_id) return null;
    return await requisition_get(mama_id, id);
  }

  async function createRequisition({
    date_requisition = new Date().toISOString().slice(0, 10),
    zone_id = null,
    commentaire = "",
    statut = "brouillon",
    lignes = []
  }) {
    if (!mama_id || !zone_id) return { error: "mama_id manquant" };
    const { id } = await requisition_create({
      date_requisition,
      zone_id,
      commentaire,
      statut,
      mama_id,
      lignes
    });
    return { data: await requisition_get(mama_id, id) };
  }

  async function updateRequisition(id, fields) {
    if (!mama_id) return { error: "mama_id manquant" };
    await requisition_update(id, fields);
    return { data: await requisition_get(mama_id, id) };
  }

  async function deleteRequisition(id) {
    if (!mama_id) return { error: "mama_id manquant" };
    await requisition_delete(id);
    return { data: true };
  }

  return {
    fetchRequisitions,
    getRequisitions,
    getRequisitionById,
    createRequisition,
    updateRequisition,
    deleteRequisition,
    refetch: getRequisitions
  };
}

export default useRequisitions;
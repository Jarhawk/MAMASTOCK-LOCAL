// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from "@/hooks/useAuditLog";
import {
  pertes_list,
  pertes_add,
  pertes_update,
  pertes_delete } from
"@/local/pertes";import { isTauri } from "@/lib/tauriEnv";

export function usePertes() {
  const { mama_id } = useAuth();
  const { log } = useAuditLog();
  const [pertes, setPertes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchPertes({ debut = null, fin = null } = {}) {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await pertes_list({ mama_id, debut, fin });
      setPertes(data);
      return data;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function addPerte(values) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await pertes_add({ ...values, mama_id });
      await log("Ajout perte", values);
      await fetchPertes();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function updatePerte(id, values) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await pertes_update(id, values);
      await log("Modification perte", { id, ...values });
      await fetchPertes();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function deletePerte(id) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await pertes_delete(id);
      await log("Suppression perte", { id });
      await fetchPertes();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return { pertes, loading, error, fetchPertes, addPerte, updatePerte, deletePerte };
}
// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { alertes_list, alertes_add, alertes_update, alertes_delete } from "@/lib/db";

import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/tauriEnv";

export function useAlerts() {
  const { mama_id } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRules = useCallback(async ({ search = "", actif = null } = {}) => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await alertes_list(mama_id, { search, actif });
      setRules(Array.isArray(data) ? data : []);
      setError(null);
      return data || [];
    } catch (e) {
      setError(e.message || e);
      setRules([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  async function addRule(values) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await alertes_add({ ...values, mama_id });
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function updateRule(id, values) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await alertes_update(id, values);
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRule(id) {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      await alertes_delete(id);
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  return { rules, loading, error, fetchRules, addRule, updateRule, deleteRule };
}
// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { taches_list, tache_get, taches_by_status, tache_add, tache_update, tache_delete } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

export function useTasks() {
  const { mama_id } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const rows = await taches_list(mama_id);
      setTasks(Array.isArray(rows) ? rows : []);
      return rows || [];
    } catch (e) {
      setError(e.message || String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  const fetchTaskById = useCallback(async (id) => {
    if (!mama_id || !id) return null;
    try {
      return await tache_get(id, mama_id);
    } catch (e) {
      setError(e.message || String(e));
      return null;
    }
  }, [mama_id]);

  const fetchTasksByStatus = useCallback(async (statut) => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const rows = await taches_by_status(mama_id, statut);
      return rows || [];
    } catch (e) {
      setError(e.message || String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  const addTask = useCallback(async (values) => {
    if (!mama_id) return { error: "Aucun mama_id" };
    setLoading(true);
    setError(null);
    try {
      const data = await tache_add({ ...values, mama_id });
      await fetchTasks();
      setLoading(false);
      return data;
    } catch (e) {
      setLoading(false);
      setError(e.message || String(e));
      return { error: e };
    }
  }, [mama_id, fetchTasks]);

  const updateTask = useCallback(async (id, values) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tache_update(id, mama_id, values);
      await fetchTasks();
      setLoading(false);
      return data;
    } catch (e) {
      setLoading(false);
      setError(e.message || String(e));
      return { error: e };
    }
  }, [mama_id, fetchTasks]);

  const deleteTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await tache_delete(id, mama_id);
      await fetchTasks();
      setLoading(false);
      return {};
    } catch (e) {
      setLoading(false);
      setError(e.message || String(e));
      return { error: e };
    }
  }, [mama_id, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchTaskById,
    fetchTasksByStatus,
    addTask,
    updateTask,
    deleteTask
  };
}

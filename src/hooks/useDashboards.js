// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { useAuth } from '@/hooks/useAuth';
import {
  dashboards_list,
  dashboard_create,
  gadget_add,
  gadget_update,
  gadget_delete,
} from "@/lib/db";

export function useDashboards() {
  const { id: user_id, mama_id } = useAuth();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboards = useCallback(async () => {
    if (!user_id || !mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await dashboards_list(user_id, mama_id);
      setDashboards(Array.isArray(data) ? data : []);
      return data || [];
    } catch (e) {
      setError(e.message || e);
      setDashboards([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user_id, mama_id]);

  async function createDashboard(nom) {
    if (!user_id || !mama_id) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await dashboard_create({ nom, utilisateur_id: user_id, mama_id });
      setDashboards((d) => [...d, { ...data, widgets: [] }]);
      return data;
    } catch (e) {
      setError(e.message || e);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function addWidget(dashboardId, config) {
    if (!dashboardId) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await gadget_add({ tableau_id: dashboardId, config, mama_id });
      setDashboards((ds) =>
        ds.map((db) =>
          db.id === dashboardId
            ? { ...db, widgets: [...(db.widgets || []), data] }
            : db
        )
      );
      return data;
    } catch (e) {
      setError(e.message || e);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function updateWidget(dashboardId, id, values) {
    if (!dashboardId || !id) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await gadget_update(id, values);
      setDashboards((ds) =>
        ds.map((db) => ({
          ...db,
          widgets: db.widgets?.map((w) => (w.id === id ? data : w)) || [],
        }))
      );
      return data;
    } catch (e) {
      setError(e.message || e);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function deleteWidget(dashboardId, id) {
    if (!dashboardId || !id) return;
    setLoading(true);
    setError(null);
    try {
      await gadget_delete(id);
      setDashboards((ds) =>
        ds.map((db) => ({
          ...db,
          widgets: db.widgets?.filter((w) => w.id !== id) || [],
        }))
      );
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }

  return {
    dashboards,
    loading,
    error,
    getDashboards,
    createDashboard,
    addWidget,
    updateWidget,
    deleteWidget
  };
}
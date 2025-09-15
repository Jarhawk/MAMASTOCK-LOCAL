import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboards_list, gadget_add, gadget_update, gadget_delete } from '@/lib/db';import { isTauri } from "@/lib/db/sql";

export function useGadgets() {
  const { id: user_id, mama_id } = useAuth();
  const [gadgets, setGadgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGadgets = useCallback(async () => {
    if (!user_id || !mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const dashboards = await dashboards_list(user_id, mama_id);
      const list = (dashboards || []).flatMap((d) => d.widgets || []);
      setGadgets(list);
      return list;
    } catch (e) {
      setError(e.message || e);
      setGadgets([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user_id, mama_id]);

  const addGadget = useCallback(async (gadget) => {
    if (!mama_id) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await gadget_add({ ...gadget, mama_id });
      setGadgets((g) => [...g, data]);
      return data;
    } catch (e) {
      setError(e.message || e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  const updateGadget = useCallback(async (id, values) => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await gadget_update(id, values);
      setGadgets((g) => g.map((x) => x.id === id ? data : x));
      return data;
    } catch (e) {
      setError(e.message || e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGadget = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      await gadget_delete(id);
      setGadgets((g) => g.filter((x) => x.id !== id));
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    gadgets,
    loading,
    error,
    fetchGadgets,
    addGadget,
    updateGadget,
    deleteGadget
  };
}
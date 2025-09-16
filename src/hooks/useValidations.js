// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  validation_requests_list,
  validation_requests_add,
  validation_requests_update } from
'@/local/validations';import { isTauri } from "@/lib/tauriEnv";

export default function useValidations() {
  const { mama_id, user } = useAuth();
  const user_id = user?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const list = await validation_requests_list(mama_id);
      setItems(Array.isArray(list) ? list : []);
      return list || [];
    } catch (e) {
      setError(e.message || String(e));
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  const addRequest = useCallback(
    async (payload) => {
      if (!mama_id) return { error: 'Aucun mama_id' };
      setLoading(true);
      setError(null);
      try {
        const id = await validation_requests_add({
          ...payload,
          mama_id,
          requested_by: user_id,
          actif: true
        });
        await fetchRequests();
        return { id };
      } catch (e) {
        setError(e.message || String(e));
        return { error: e.message || String(e) };
      } finally {
        setLoading(false);
      }
    },
    [mama_id, user_id, fetchRequests]
  );

  const updateStatus = useCallback(
    async (id, status) => {
      setLoading(true);
      setError(null);
      try {
        await validation_requests_update(id, {
          status,
          reviewed_by: user_id,
          reviewed_at: new Date().toISOString()
        });
        await fetchRequests();
        return { id };
      } catch (e) {
        setError(e.message || String(e));
        return { error: e.message || String(e) };
      } finally {
        setLoading(false);
      }
    },
    [user_id, fetchRequests]
  );

  return { fetchRequests, addRequest, updateStatus, items, loading, error };
}
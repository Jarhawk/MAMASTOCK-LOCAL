// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { api_keys_list, api_keys_create, api_keys_revoke } from "@/local/apiKeys";import { isTauri } from "@/lib/tauriEnv";

export function useApiKeys() {
  const { mama_id, user_id } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const listKeys = useCallback(async () => {
    if (!mama_id) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await api_keys_list(mama_id);
      setKeys(data);
      return data;
    } catch (e) {
      setError(e);
      setKeys([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  const createKey = useCallback(async ({ name, scopes, role, expiration }) => {
    if (!mama_id || !user_id) return { error: 'missing context' };
    setLoading(true);
    setError(null);
    try {
      const item = await api_keys_create({ name, scopes, role, expiration, mama_id, user_id });
      setKeys((k) => [item, ...k]);
      return { data: item };
    } catch (error) {
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [mama_id, user_id]);

  const revokeKey = useCallback(async (id) => {
    if (!mama_id) return { error: 'missing mama_id' };
    setLoading(true);
    setError(null);
    try {
      await api_keys_revoke(mama_id, id);
      setKeys((k) => k.map((key) => key.id === id ? { ...key, revoked: true } : key));
      return { error: null };
    } catch (error) {
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  return { keys, loading, error, listKeys, createKey, revokeKey };
}
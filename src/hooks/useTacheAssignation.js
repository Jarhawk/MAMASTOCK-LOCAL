// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useCallback } from "react";
import { tache_assign_users, tache_unassign_user } from "@/lib/db";import { isTauri } from "@/lib/runtime/isTauri";


export function useTacheAssignation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const assignUsers = useCallback(async (tacheId, userIds = []) => {
    setLoading(true);
    setError(null);
    try {
      await tache_assign_users(tacheId, userIds);
      return {};
    } catch (e) {
      setError(e.message || String(e));
      return { error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  const unassignUser = useCallback(async (tacheId, userId) => {
    setLoading(true);
    setError(null);
    try {
      await tache_unassign_user(tacheId, userId);
      return {};
    } catch (e) {
      setError(e.message || String(e));
      return { error: e };
    } finally {
      setLoading(false);
    }
  }, []);

  return { assignUsers, unassignUser, loading, error };
}

export default useTacheAssignation;
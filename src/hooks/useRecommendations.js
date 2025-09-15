// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState, useEffect, useCallback } from "react";

import { useAuth } from '@/hooks/useAuth';
import { getRecommendations } from "@/local/recommendations";import { isTauri } from "@/lib/db/sql";

export function useRecommendations() {
  const { id: user_id, mama_id } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const recos = await getRecommendations(user_id, mama_id);
    setItems(recos);
    setLoading(false);
  }, [user_id, mama_id]);

  useEffect(() => {
    if (mama_id) refresh();
  }, [mama_id, refresh]);

  return { recommendations: items, loading, refresh };
}

export { getRecommendations };
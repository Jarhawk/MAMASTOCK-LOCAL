// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState } from 'react';
import { fournisseurs_recents } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/tauriEnv";

export default function useFournisseursRecents(limit = 10) {
  const { mama_id } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mama_id) return;
    let aborted = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fournisseurs_recents(limit);
        if (!aborted) setData(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error(err);
        if (!aborted) {
          setError(err);
          setData([]);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    run();
    return () => {
      aborted = true;
    };
  }, [mama_id, limit]);

  return { data, loading, error };
}
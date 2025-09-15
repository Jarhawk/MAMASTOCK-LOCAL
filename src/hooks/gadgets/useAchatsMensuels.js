import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { achats_mensuels_list } from "@/lib/db";import { isTauri } from "@/lib/runtime/isTauri";

export default function useAchatsMensuels() {
  const { mama_id, loading: authLoading } = useAuth() || {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!mama_id) {
      setData([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await achats_mensuels_list(mama_id);
        setData(rows || []);
      } catch (e) {
        setError(e);
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, mama_id]);

  return { data, loading, error };
}
import { useEffect, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { top_fournisseurs_list } from '@/lib/db';import { isTauri } from "@/lib/tauriEnv";

export default function useTopFournisseurs() {
  const { mama_id, loading: authLoading } = useAuth() || {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !mama_id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await top_fournisseurs_list(mama_id);
        setData(
          (rows || []).map((r) => ({
            id: r.id,
            montant: Number(r.montant || 0),
            mois: r.mois
          }))
        );
      } catch (e) {
        setError(e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, mama_id]);

  return { data, loading, error };
}
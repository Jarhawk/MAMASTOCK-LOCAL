// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useEffect, useState, useCallback } from "react";
import { useAuth } from '@/hooks/useAuth';
import {
  signalements_list,
  signalement_insert,
  signalement_get } from
"@/local/signalements";import { isTauri } from "@/lib/runtime/isTauri";

export function useSignalements() {
  const { mama_id, user_id, loading: authLoading } = useAuth();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSignalements = useCallback(async () => {
    if (!mama_id || authLoading) return;

    setLoading(true);
    try {
      const list = await signalements_list({ mama_id });
      setSignalements(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      console.error("❌ Erreur chargement signalements:", err?.message);
      setError(err);
      setSignalements([]);
    } finally {
      setLoading(false);
    }
  }, [mama_id, authLoading]);

  useEffect(() => {
    if (!authLoading) fetchSignalements();
  }, [authLoading, fetchSignalements]);

  const addSignalement = async (newSignalement) => {
    if (!mama_id || authLoading) return;

    await signalement_insert({
      ...newSignalement,
      mama_id,
      created_by: user_id,
      date: new Date().toISOString()
    });
    await fetchSignalements();
  };

  return { data: signalements, loading, error, addSignalement };
}

export function useSignalement(id) {
  const [signalement, setSignalement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { mama_id, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchSignalement = async () => {
      if (!id || !mama_id || authLoading) return;
      try {
        const sig = await signalement_get(mama_id, id);
        setSignalement(sig);
        setError(null);
      } catch (err) {
        console.error("❌ Erreur fetch signalement:", err?.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSignalement();
  }, [id, mama_id, authLoading]);

  return { signalement, loading, error };
}
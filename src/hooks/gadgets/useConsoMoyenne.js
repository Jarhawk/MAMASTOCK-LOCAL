import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDb } from "@/lib/db/sql";import { isTauri } from "@/lib/runtime/isTauri";

export async function fetchConsoMoyenne(mamaId, sinceISO) {
  if (!isTauri) {
    console.info('fetchConsoMoyenne: ignoré hors Tauri');
    return { conso: 0 };
  }
  try {
    const db = await getDb();
    const rows = await db.select(
      `SELECT rl.quantite, r.date_requisition
         FROM requisition_lignes rl
         JOIN requisitions r ON r.id = rl.requisition_id
        WHERE r.mama_id = ?
          AND r.statut = 'réalisée'
          AND r.date_requisition >= ?
        ORDER BY r.date_requisition ASC`,
      [mamaId, sinceISO]
    );
    const daily = {};
    (rows || []).forEach((m) => {
      const d = m.date_requisition?.slice(0, 10);
      if (!daily[d]) daily[d] = 0;
      daily[d] += Number(m.quantite || 0);
    });
    const values = Object.values(daily);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { conso: avg };
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes('sql.load not allowed')) {
      console.warn('fetchConsoMoyenne: sql.load not allowed – TODO vérifier src-tauri/capabilities/sql.json');
      return { conso: 0 };
    }
    throw e;
  }
}

export default function useConsoMoyenne() {
  const { mama_id } = useAuth();
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!mama_id) return 0;
    setLoading(true);
    setError(null);
    try {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      const { conso } = await fetchConsoMoyenne(mama_id, start.toISOString());
      setAvg(conso);
      if (import.meta.env.DEV) {
        console.debug('Chargement dashboard terminé');
      }
      return conso;
    } catch (e) {
      console.warn('useConsoMoyenne', e);
      setError(e);
      setAvg(0);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [mama_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { avg, loading, error, refresh: fetchData };
}
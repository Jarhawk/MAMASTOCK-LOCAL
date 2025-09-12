// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
// src/hooks/useStats.js
import { useState, useEffect, useCallback } from "react";
import { one } from "@/local/db";
import { useAuth } from '@/hooks/useAuth';

export function useStats() {
  const { mama_id } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    const totalProduits =
      (await one<{ cnt: number }>(
        "SELECT COUNT(*) as cnt FROM produits WHERE mama_id = ?",
        [mama_id]
      ))?.cnt || 0;

    const fichesRow =
      (await one<{ count: number; total: number }>(
        "SELECT COUNT(*) as count, SUM(cout_total) as total FROM fiches_techniques WHERE mama_id = ?",
        [mama_id]
      )) || { count: 0, total: 0 };

    const mouvementsTotal =
      (await one<{ total: number }>(
        `SELECT SUM(rl.quantite) as total
         FROM requisition_lignes rl
         JOIN requisitions r ON rl.requisition_id = r.id
         WHERE r.mama_id = ? AND r.statut = 'réalisée'`,
        [mama_id]
      ))?.total || 0;

    setStats({
      totalProduits,
      totalFiches: fichesRow.count || 0,
      coutTotalFiches: fichesRow.total || 0,
      mouvementsTotal,
    });

    setLoading(false);
  }, [mama_id]);

  useEffect(() => {
    if (mama_id) fetchStats();
  }, [mama_id, fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
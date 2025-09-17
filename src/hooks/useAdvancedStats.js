// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { useState } from "react";
import { getDb } from "@/lib/db/database";import { isTauri } from "@/lib/tauriEnv";

export function useAdvancedStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    async function fetchStats({ start, end } = {}) {
      if (!isTauri()) {
        console.info('useAdvancedStats: ignoré hors Tauri');
        return [];
      }
      setLoading(true);
      try {
      const db = await getDb();
      const params = [];
      let sql = "SELECT mois, montant FROM v_advanced_stats";
      if (start || end) {
        sql += " WHERE 1=1";
        if (start) { sql += " AND mois >= ?"; params.push(start); }
        if (end) { sql += " AND mois <= ?"; params.push(end); }
      }
      const rows = await db.select(sql, params);
      setData(rows);
      setError(null);
      return rows;
    } catch (err) {
      setError(err);
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, fetchStats };
}
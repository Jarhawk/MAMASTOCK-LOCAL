// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { query } from '@/local/db';
import { useAuth } from '@/hooks/useAuth';import { isTauri } from "@/lib/db/sql";

export function useAnalytique() {
  const { mama_id } = useAuth();

  function applyPeriode(sqlParts, params, periode = {}) {
    if (periode.debut) {
      sqlParts.push('date >= ?');
      params.push(periode.debut);
    }
    if (periode.fin) {
      sqlParts.push('date <= ?');
      params.push(periode.fin);
    }
  }

  async function getVentilationProduits(periode = {}, centre_id = null) {
    if (!mama_id) return [];
    const where = ['mama_id = ?'];
    const params = [mama_id];
    if (centre_id) {
      where.push('cost_center_id = ?');
      params.push(centre_id);
    }
    applyPeriode(where, params, periode);
    const sql = `SELECT famille, activite, cost_center_id, cost_center_nom, SUM(quantite) as sum, SUM(valeur) as sumv FROM v_analytique_stock WHERE ${where.join(' AND ')} GROUP BY famille, activite, cost_center_id, cost_center_nom`;
    return await query(sql, params);
  }

  async function getEcartsParFamille(periode = {}) {
    if (!mama_id) return [];
    const where = ['mama_id = ?'];
    const params = [mama_id];
    applyPeriode(where, params, periode);
    const sql = `SELECT famille, SUM(valeur) as sumv FROM v_analytique_stock WHERE ${where.join(' AND ')} GROUP BY famille`;
    return await query(sql, params);
  }

  async function getConsommationParActivite(periode = {}, centre_id = null) {
    if (!mama_id) return [];
    const where = ['mama_id = ?'];
    const params = [mama_id];
    if (centre_id) {
      where.push('cost_center_id = ?');
      params.push(centre_id);
    }
    applyPeriode(where, params, periode);
    const sql = `SELECT activite, SUM(valeur) as sumv FROM v_analytique_stock WHERE ${where.join(' AND ')} GROUP BY activite`;
    return await query(sql, params);
  }

  return { getVentilationProduits, getEcartsParFamille, getConsommationParActivite };
}

export default useAnalytique;
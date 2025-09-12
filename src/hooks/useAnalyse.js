// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { query } from '@/local/db';
import { useAuth } from '@/hooks/useAuth';

export function useAnalyse() {
  const { mama_id } = useAuth();

  function buildPeriode(where, params, { debut, fin } = {}) {
    if (debut) { where.push('mois >= ?'); params.push(debut); }
    if (fin) { where.push('mois <= ?'); params.push(fin); }
  }

  async function getMonthlyPurchases(filters = {}) {
    if (!mama_id) return [];
    const where = ['mama_id = ?'];
    const params = [mama_id];
    buildPeriode(where, params, filters);
    const sql = `SELECT mois, montant_total FROM v_achats_mensuels WHERE ${where.join(' AND ')} ORDER BY mois ASC`;
    return await query(sql, params);
  }

  async function getEvolutionAchats(filters = {}) {
    if (!mama_id) return [];
    const where = ['mama_id = ?'];
    const params = [mama_id];
    buildPeriode(where, params, filters);
    const sql = `SELECT mois, montant FROM v_evolution_achats WHERE ${where.join(' AND ')} ORDER BY mois ASC`;
    return await query(sql, params);
  }

  async function getPmp() {
    if (!mama_id) return [];
    const sql = `SELECT * FROM v_pmp WHERE mama_id = ?`;
    return await query(sql, [mama_id]);
  }

  async function getEcartsInventaire(filters = {}) {
    if (!mama_id) return [];
    const where = ['mama_id = ?'];
    const params = [mama_id];
    if (filters.produit_id) { where.push('produit_id = ?'); params.push(filters.produit_id); }
    const sql = `SELECT date, ecart FROM v_ecarts_inventaire WHERE ${where.join(' AND ')} ORDER BY date ASC`;
    return await query(sql, params);
  }

  return { getMonthlyPurchases, getEvolutionAchats, getPmp, getEcartsInventaire };
}

export default useAnalyse;
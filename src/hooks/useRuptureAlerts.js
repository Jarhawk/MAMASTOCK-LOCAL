import { useAuth } from '@/hooks/useAuth';
import { isTauri, getDb } from '@/lib/sql';

export function useRuptureAlerts() {
  const { mama_id } = useAuth();

  async function fetchAlerts(type = null) {
    if (!mama_id || !isTauri) return [];
    const db = await getDb();
    const params = [];
    let sql =
      "SELECT produit_id as id, produit_id, nom, unite, fournisseur_nom, stock_actuel, stock_min, manque, consommation_prevue, receptions, stock_projete, type FROM v_alertes_rupture_api";
    if (type) {
      sql += " WHERE type = ?";
      params.push(type);
    }
    sql += " ORDER BY manque DESC";
    try {
      return await db.select(sql, params);
    } catch {
      return [];
    }
  }

  async function generateSuggestions() {
    // Pas de génération automatique hors ligne
    if (!mama_id || !isTauri) return { suggestions: [] };
    return { suggestions: [] };
  }

  return { fetchAlerts, generateSuggestions };
}
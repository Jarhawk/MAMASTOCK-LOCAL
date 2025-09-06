// MamaStock © 2025 - Licence commerciale obligatoire - Toute reproduction interdite sans autorisation.
import { getDb } from '@/lib/db';

// Stats d’évolution d’achats (tous fournisseurs ou par fournisseur)
export function useFournisseurStats() {
  // Stats tous fournisseurs (évolution mensuelle)
  async function fetchStatsAll() {
    const db = await getDb();
    const rows = await db.select(
      `SELECT substr(f.date_iso,1,7) as mois, IFNULL(SUM(fl.quantite * fl.prix_unitaire),0) as total_achats
         FROM factures f
         JOIN facture_lignes fl ON fl.facture_id = f.id
         GROUP BY mois
         ORDER BY mois`
    );
    return rows;
  }

  // Stats pour 1 fournisseur précis (évolution mensuelle)
  async function fetchStatsForFournisseur(fournisseur_id) {
    const db = await getDb();
    const rows = await db.select(
      `SELECT substr(f.date_iso,1,7) as mois, IFNULL(SUM(fl.quantite * fl.prix_unitaire),0) as total_achats
         FROM factures f
         JOIN facture_lignes fl ON fl.facture_id = f.id
         WHERE f.fournisseur_id = ?
         GROUP BY mois
         ORDER BY mois`,
      [fournisseur_id]
    );
    return rows;
  }

  return { fetchStatsAll, fetchStatsForFournisseur };
}
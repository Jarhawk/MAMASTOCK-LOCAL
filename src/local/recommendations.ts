// @ts-nocheck
import { query } from "@/lib/db";import { isTauri } from "@/lib/tauriEnv";

export async function getRecommendations(user_id: string | null, mama_id: string | null) {
  if (!mama_id) return [] as any[];
  const recos: any[] = [];

  const stockMort = await query(
    `SELECT produit_id, nom, jours_inactif FROM v_reco_stockmort WHERE mama_id = ?`,
    [mama_id]
  );
  stockMort.forEach((r: any) => {
    recos.push({
      type: "alert",
      category: "rotation",
      produit_id: r.produit_id,
      message: `Stock mort: ${r.nom} inactif depuis ${r.jours_inactif} jours`
    });
  });

  const surcout = await query(
    `SELECT produit_id, nom, variation_pct FROM v_reco_surcout WHERE mama_id = ? AND variation_pct >= 20`,
    [mama_id]
  );
  surcout.forEach((r: any) => {
    recos.push({
      type: "alert",
      category: "coût",
      produit_id: r.produit_id,
      message: `Coût excessif pour ${r.nom} : +${Number(r.variation_pct).toFixed(1)}%`
    });
  });

  const produits = await query(
    `SELECT id, nom, stock_reel, stock_min, actif FROM produits WHERE mama_id = ?`,
    [mama_id]
  );
  produits.
  filter((p: any) => p.actif && p.stock_min !== null && Number(p.stock_reel) < Number(p.stock_min)).
  forEach((p: any) => {
    recos.push({
      type: "suggestion",
      category: "stock",
      produit_id: p.id,
      message: `Passer commande: ${p.nom} (stock ${p.stock_reel} < ${p.stock_min})`
    });
  });

  const periode = new Date().toISOString().slice(0, 7);
  const budgets = await query(
    `SELECT famille, ecart_pct FROM v_calc_budgets WHERE mama_id = ? AND periode = ?`,
    [mama_id, periode]
  );
  budgets.
  filter((b: any) => b.ecart_pct !== null && Math.abs(Number(b.ecart_pct)) > 15).
  forEach((b: any) => {
    recos.push({
      type: "alert",
      category: "budget",
      message: `Ecart budget ${b.famille}: ${Number(b.ecart_pct).toFixed(1)}%`
    });
  });

  return recos;
}
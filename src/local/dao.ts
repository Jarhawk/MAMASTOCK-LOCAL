// src/local/dao.ts
import { query, exec, one } from "./db";

// Exemples : adapte aux tables de ton schéma SQLite
import { isTauri } from "@/lib/tauriEnv";export async function listProducts() {
  return await query("SELECT * FROM produits ORDER BY nom");
}
export async function getProduct(id: string) {
  return await one("SELECT * FROM produits WHERE id = ?", [id]);
}
export async function upsertProduct(p: any) {
  if (p.id) {
    await exec("UPDATE produits SET nom=?, prix=? WHERE id=?", [p.nom, p.prix, p.id]);
    return p.id;
  } else {
    await exec("INSERT INTO produits (id, nom, prix) VALUES (?, ?, ?)", [p.id, p.nom, p.prix]);
    return p.id;
  }
}
export async function recordStockMove({ produit_id, qte, prix_unitaire

}: {produit_id: string;qte: number;prix_unitaire: number;}) {
  await exec("INSERT INTO mouvements (produit_id, qte, prix_unitaire) VALUES (?, ?, ?)", [produit_id, qte, prix_unitaire]);
  // Si tu as des triggers/ vues pour PMP, ils s’actualiseront
}
export async function getPmp(produit_id: string) {
  return await one("SELECT pmp, stock, valeur FROM pmp_valeur_stock WHERE produit_id = ?", [produit_id]);
}
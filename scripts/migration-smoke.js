import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
const root = process.cwd();
const MIGS = [
  "db/sqlite/001_schema.sql",
  "db/sqlite/002_seed.sql",
];
const db = new Database(":memory:");
for (const mig of MIGS) {
  const sql = fs.readFileSync(path.join(root, mig), "utf8");
  db.exec(sql);
}

db.exec("INSERT INTO fournisseurs (nom) VALUES ('Four');");
const fournisseurId = db.prepare("SELECT last_insert_rowid()").pluck().get();
db.exec("INSERT INTO produits (nom) VALUES ('Prod');");
const produitId = db.prepare("SELECT last_insert_rowid()").pluck().get();
db.exec(`INSERT INTO factures (fournisseur_id, date_iso) VALUES (${fournisseurId}, '2025-01-01');`);
const factureId = db.prepare("SELECT last_insert_rowid()").pluck().get();
db.exec(`INSERT INTO facture_lignes (facture_id, produit_id, quantite, prix_unitaire) VALUES (${factureId}, ${produitId}, 10, 2.5);`);
let row = db.prepare("SELECT stock_theorique AS stock, valeur_stock AS valeur, pmp FROM produits WHERE id=?").get(produitId);
if (Math.abs(row.stock - 10) > 0.0001 || Math.abs(row.valeur - 25) > 0.0001 || Math.abs(row.pmp - 2.5) > 0.0001) {
  console.error('INSERT invalide', row);
  process.exit(1);
}

db.exec("UPDATE facture_lignes SET quantite=20, prix_unitaire=3 WHERE id=1;");
row = db.prepare("SELECT stock_theorique AS stock, valeur_stock AS valeur, pmp FROM produits WHERE id=?").get(produitId);
if (Math.abs(row.stock - 20) > 0.0001 || Math.abs(row.valeur - 60) > 0.0001 || Math.abs(row.pmp - 3) > 0.0001) {
  console.error('UPDATE invalide', row);
  process.exit(1);
}

db.exec("DELETE FROM facture_lignes WHERE id=1;");
row = db.prepare("SELECT stock_theorique AS stock, valeur_stock AS valeur, pmp FROM produits WHERE id=?").get(produitId);
if (Math.abs(row.stock) > 0.0001 || Math.abs(row.valeur) > 0.0001 || Math.abs(row.pmp) > 0.0001) {
  console.error('DELETE invalide', row);
  process.exit(1);
}

console.log('✅ migration smoke ok', {
  insert: { stock: 10, valeur: 25, pmp: 2.5 },
  update: { stock: 20, valeur: 60, pmp: 3 },
  delete: { stock: 0, valeur: 0, pmp: 0 }
});

// Vérifie rapidement le schéma et les triggers
import { readFileSync } from 'fs';
import initSqlJs from 'sql.js';

async function main() {
  const SQL = await initSqlJs({ locateFile: f => `node_modules/sql.js/dist/${f}` });
  const db = new SQL.Database();
  const files = [
    'db/sqlite/001_schema.sql',
    'db/sqlite/002_seed.sql',
    'db/sqlite/003_pmp_valeur_stock.sql',
  ];
  for (const file of files) {
    const sql = readFileSync(file, 'utf8');
    db.exec(sql);
  }

  db.run("INSERT INTO fournisseurs (nom) VALUES ('Four');");
  const fournisseurId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  db.run("INSERT INTO produits (nom) VALUES ('Prod');");
  const produitId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  db.run(`INSERT INTO factures (fournisseur_id, date_iso) VALUES (${fournisseurId}, '2025-01-01');`);
  const factureId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  db.run(`INSERT INTO facture_lignes (facture_id, produit_id, quantite, prix_unitaire) VALUES (${factureId}, ${produitId}, 10, 2.5);`);
  let res = db.exec(`SELECT stock_theorique, valeur_stock, pmp FROM produits WHERE id=${produitId};`);
  let [stock, valeur, pmp] = res[0].values[0];
  if (Math.abs(stock - 10) > 0.0001 || Math.abs(valeur - 25) > 0.0001 || Math.abs(pmp - 2.5) > 0.0001) {
    console.error('INSERT invalide', { stock, valeur, pmp });
    process.exit(1);
  }

  db.run(`UPDATE facture_lignes SET quantite=20, prix_unitaire=3 WHERE id=1;`);
  res = db.exec(`SELECT stock_theorique, valeur_stock, pmp FROM produits WHERE id=${produitId};`);
  [stock, valeur, pmp] = res[0].values[0];
  if (Math.abs(stock - 20) > 0.0001 || Math.abs(valeur - 60) > 0.0001 || Math.abs(pmp - 3) > 0.0001) {
    console.error('UPDATE invalide', { stock, valeur, pmp });
    process.exit(1);
  }

  db.run(`DELETE FROM facture_lignes WHERE id=1;`);
  res = db.exec(`SELECT stock_theorique, valeur_stock, pmp FROM produits WHERE id=${produitId};`);
  [stock, valeur, pmp] = res[0].values[0];
  if (Math.abs(stock) > 0.0001 || Math.abs(valeur) > 0.0001 || Math.abs(pmp) > 0.0001) {
    console.error('DELETE invalide', { stock, valeur, pmp });
    process.exit(1);
  }
  console.log('✅ migration smoke ok', { insert: { stock: 10, valeur: 25, pmp: 2.5 }, update: { stock: 20, valeur: 60, pmp: 3 }, delete: { stock: 0, valeur: 0, pmp: 0 } });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

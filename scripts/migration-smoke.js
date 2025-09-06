// Vérifie rapidement le schéma et les triggers
import { readFileSync } from 'fs';
import initSqlJs from 'sql.js';

async function main() {
  const SQL = await initSqlJs({ locateFile: f => `node_modules/sql.js/dist/${f}` });
  const db = new SQL.Database();
  const schema = readFileSync('db/sqlite/001_schema.sql', 'utf8');
  db.exec(schema);
  const seed = readFileSync('db/sqlite/002_seed.sql', 'utf8');
  db.exec(seed);

  db.run("INSERT INTO fournisseurs (nom) VALUES ('Four');");
  const fournisseurId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  db.run("INSERT INTO produits (nom) VALUES ('Prod');");
  const produitId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  db.run(`INSERT INTO factures (fournisseur_id, date_iso) VALUES (${fournisseurId}, '2025-01-01');`);
  const factureId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  db.run(`INSERT INTO facture_lignes (facture_id, produit_id, quantite, prix_unitaire) VALUES (${factureId}, ${produitId}, 10, 2.5);`);

  const res = db.exec(`SELECT stock_theorique, pmp FROM produits WHERE id=${produitId};`);
  const [stock, pmp] = res[0].values[0];
  if (Math.abs(stock - 10) > 0.0001 || Math.abs(pmp - 2.5) > 0.0001) {
    console.error('Valeurs inattendues', { stock, pmp });
    process.exit(1);
  }
  console.log('✅ migration smoke ok');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

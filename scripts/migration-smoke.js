// Simple smoke test to ensure migration and triggers work
import { readFileSync } from 'fs';
import initSqlJs from 'sql.js';

async function main() {
  const SQL = await initSqlJs({ locateFile: file => `node_modules/sql.js/dist/${file}` });
  const db = new SQL.Database();
  const m1 = readFileSync('public/migrations/001_init.sql', 'utf8');
  db.exec(m1);
  const m2 = readFileSync('public/migrations/002_local_auth.sql', 'utf8');
  db.exec(m2);

  db.run("INSERT INTO fournisseurs (id, nom) VALUES ('f1','Four');");
  db.run("INSERT INTO produits (id, fournisseur_id, nom) VALUES ('p1','f1','Prod');");
  db.run("INSERT INTO factures (id, fournisseur_id, total, date) VALUES ('fa1','f1',10,'2025-01-01');");
  db.run("INSERT INTO facture_lignes (id, facture_id, produit_id, quantite, prix) VALUES ('l1','fa1','p1',2,5);");

  const res = db.exec("SELECT stock, pmp FROM produits WHERE id='p1';");
  if (!res.length) throw new Error('No product');
  const [stock, pmp] = res[0].values[0];
  if (stock !== 2 || pmp !== 5) {
    throw new Error(`Unexpected values: stock=${stock} pmp=${pmp}`);
  }
  console.log('migration smoke ok');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

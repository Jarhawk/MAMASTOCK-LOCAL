#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

try {
  const schema = readFileSync(join(process.cwd(), 'db', 'sqlite', '001_schema.sql'), 'utf8');
  const db = new Database(':memory:');
  db.exec(schema);

  const fournisseurId = db.prepare('INSERT INTO fournisseurs (nom) VALUES (?)').run('Fournisseur A').lastInsertRowid;
  const produitId = db.prepare('INSERT INTO produits (nom) VALUES (?)').run('Produit A').lastInsertRowid;
  const factureId = db.prepare('INSERT INTO factures (fournisseur_id, date_iso) VALUES (?, ?)').run(fournisseurId, '2024-01-01').lastInsertRowid;
  db.prepare('INSERT INTO facture_lignes (facture_id, produit_id, quantite, prix_unitaire) VALUES (?,?,?,?)').run(factureId, produitId, 10, 2.5);
  const prod = db.prepare('SELECT pmp, stock_theorique FROM produits WHERE id = ?').get(produitId);

  if (Math.abs(prod.stock_theorique - 10) < 0.0001 && Math.abs(prod.pmp - 2.5) < 0.0001) {
    console.log('✅ Stock et PMP corrects');
    process.exit(0);
  } else {
    console.error('❌ Valeurs incorrectes', prod);
    process.exit(1);
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}

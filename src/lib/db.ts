import Database from "@tauri-apps/plugin-sql";
import { dataDbPath } from "@/lib/paths";

let _db: any;
export async function getDb() {
  if (_db) return _db;
  const file = await dataDbPath();
  _db = await Database.load(`sqlite:${file}`);
  return _db;
}

// Fournisseurs
export async function fournisseurs_list() {
  const db = await getDb();
  return db.select("SELECT id, nom, email, actif FROM fournisseurs ORDER BY nom");
}
export async function fournisseurs_create({ nom, email }: {nom:string; email?:string}) {
  const db = await getDb();
  await db.execute("INSERT INTO fournisseurs(nom,email,actif) VALUES(?,?,1)", [nom, email ?? null]);
}

// Produits
export async function produits_list() {
  const db = await getDb();
  return db.select("SELECT id, nom, unite, famille, pmp, stock_theorique FROM produits ORDER BY nom");
}

// Factures (entête + lignes)
export async function facture_create({ fournisseur_id, date_iso }: {fournisseur_id:number; date_iso:string}) {
  const db = await getDb();
  await db.execute("INSERT INTO factures(fournisseur_id,date_iso) VALUES(?,?)", [fournisseur_id, date_iso]);
  const [{ id }] = await db.select("SELECT last_insert_rowid() as id");
  return id;
}
export async function facture_add_ligne({ facture_id, produit_id, quantite, prix_unitaire }:
  {facture_id:number; produit_id:number; quantite:number; prix_unitaire:number}) {
  const db = await getDb();
  await db.execute(
    "INSERT INTO facture_lignes(facture_id,produit_id,quantite,prix_unitaire) VALUES(?,?,?,?)",
    [facture_id, produit_id, quantite, prix_unitaire]
  );
}

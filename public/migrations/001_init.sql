PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS utilisateurs (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  nom TEXT,
  prenom TEXT
);

CREATE TABLE IF NOT EXISTS fournisseurs (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS produits (
  id TEXT PRIMARY KEY,
  fournisseur_id TEXT REFERENCES fournisseurs(id),
  nom TEXT NOT NULL,
  stock REAL DEFAULT 0,
  pmp REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS factures (
  id TEXT PRIMARY KEY,
  fournisseur_id TEXT REFERENCES fournisseurs(id),
  total REAL,
  date TEXT
);

CREATE TABLE IF NOT EXISTS facture_lignes (
  id TEXT PRIMARY KEY,
  facture_id TEXT REFERENCES factures(id),
  produit_id TEXT REFERENCES produits(id),
  quantite REAL,
  prix REAL
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TRIGGER IF NOT EXISTS trig_facture_insert
AFTER INSERT ON facture_lignes
BEGIN
  UPDATE produits SET
    pmp = ((pmp * stock) + (NEW.prix * NEW.quantite)) / (stock + NEW.quantite),
    stock = stock + NEW.quantite
  WHERE id = NEW.produit_id;
END;

CREATE TRIGGER IF NOT EXISTS trig_facture_delete
AFTER DELETE ON facture_lignes
BEGIN
  UPDATE produits SET
    stock = stock - OLD.quantite
  WHERE id = OLD.produit_id;
END;

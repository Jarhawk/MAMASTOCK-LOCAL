-- Schéma SQLite local pour MamaStock
PRAGMA journal_mode=WAL;

-- Table de meta pour versionnage
CREATE TABLE IF NOT EXISTS meta (
  schema_version TEXT PRIMARY KEY
);
INSERT INTO meta(schema_version)
  SELECT '1'
  WHERE NOT EXISTS (SELECT 1 FROM meta);

-- Utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  mot_de_passe_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  actif INTEGER NOT NULL DEFAULT 1
);

-- Fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT,
  actif INTEGER NOT NULL DEFAULT 1,
  UNIQUE(nom)
);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_nom ON fournisseurs(nom);

-- Produits
CREATE TABLE IF NOT EXISTS produits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  unite TEXT,
  famille TEXT,
  actif INTEGER NOT NULL DEFAULT 1,
  pmp REAL NOT NULL DEFAULT 0,
  stock_theorique REAL NOT NULL DEFAULT 0,
  UNIQUE(nom)
);
CREATE INDEX IF NOT EXISTS idx_produits_nom ON produits(nom);

-- Factures
CREATE TABLE IF NOT EXISTS factures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fournisseur_id INTEGER NOT NULL,
  date_iso TEXT NOT NULL,
  FOREIGN KEY(fournisseur_id) REFERENCES fournisseurs(id)
);
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_iso);

-- Lignes de facture
CREATE TABLE IF NOT EXISTS facture_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  facture_id INTEGER NOT NULL,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  prix_unitaire REAL NOT NULL,
  FOREIGN KEY(facture_id) REFERENCES factures(id),
  FOREIGN KEY(produit_id) REFERENCES produits(id)
);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture ON facture_lignes(facture_id);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_produit ON facture_lignes(produit_id);

-- Trigger: après insertion d'une ligne de facture
CREATE TRIGGER IF NOT EXISTS trg_fl_insert
AFTER INSERT ON facture_lignes
BEGIN
  UPDATE produits
  SET pmp = CASE
      WHEN stock_theorique + NEW.quantite = 0 THEN pmp
      ELSE ((pmp * stock_theorique) + (NEW.prix_unitaire * NEW.quantite)) / (stock_theorique + NEW.quantite)
    END,
    stock_theorique = stock_theorique + NEW.quantite
  WHERE id = NEW.produit_id;
END;

-- Trigger: après mise à jour d'une ligne de facture
CREATE TRIGGER IF NOT EXISTS trg_fl_update
AFTER UPDATE ON facture_lignes
BEGIN
  -- Retrait de l'ancienne valeur
  UPDATE produits
  SET stock_theorique = stock_theorique - OLD.quantite,
      pmp = CASE
        WHEN stock_theorique - OLD.quantite > 0 THEN ((pmp * stock_theorique) - (OLD.prix_unitaire * OLD.quantite)) / (stock_theorique - OLD.quantite)
        ELSE 0
      END
  WHERE id = OLD.produit_id;

  -- Ajout de la nouvelle valeur
  UPDATE produits
  SET pmp = CASE
      WHEN stock_theorique + NEW.quantite = 0 THEN pmp
      ELSE ((pmp * stock_theorique) + (NEW.prix_unitaire * NEW.quantite)) / (stock_theorique + NEW.quantite)
    END,
    stock_theorique = stock_theorique + NEW.quantite
  WHERE id = NEW.produit_id;
END;

-- Trigger: après suppression d'une ligne de facture
CREATE TRIGGER IF NOT EXISTS trg_fl_delete
AFTER DELETE ON facture_lignes
BEGIN
  UPDATE produits
  SET stock_theorique = stock_theorique - OLD.quantite
  WHERE id = OLD.produit_id;
END;


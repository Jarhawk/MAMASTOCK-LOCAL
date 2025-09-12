-- Base SQLite locale pour MamaStock
PRAGMA journal_mode=WAL;

-- Table de version du schéma pour idempotence
CREATE TABLE IF NOT EXISTS meta (
  schema_version TEXT PRIMARY KEY
);
INSERT INTO meta(schema_version)
  SELECT '1'
  WHERE NOT EXISTS (SELECT 1 FROM meta);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  mot_de_passe_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  actif INTEGER NOT NULL DEFAULT 1
);

-- Table des fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT,
  actif INTEGER NOT NULL DEFAULT 1,
  UNIQUE(nom)
);

-- Zones de stockage
CREATE TABLE IF NOT EXISTS inventaire_zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  mama_id TEXT,
  type TEXT,
  parent_id INTEGER,
  position INTEGER,
  actif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY(parent_id) REFERENCES inventaire_zones(id)
);

CREATE TABLE IF NOT EXISTS zones_droits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zone_id INTEGER NOT NULL,
  mama_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  lecture INTEGER NOT NULL DEFAULT 0,
  ecriture INTEGER NOT NULL DEFAULT 0,
  transfert INTEGER NOT NULL DEFAULT 0,
  requisition INTEGER NOT NULL DEFAULT 0,
  UNIQUE(zone_id, mama_id, user_id),
  FOREIGN KEY(zone_id) REFERENCES inventaire_zones(id)
);

CREATE INDEX IF NOT EXISTS idx_zones_droits_zone ON zones_droits(zone_id, mama_id);

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mama_id TEXT,
  nom TEXT NOT NULL,
  unite TEXT,
  famille TEXT,
  zone_id INTEGER,
  actif INTEGER NOT NULL DEFAULT 1,
  pmp REAL NOT NULL DEFAULT 0,
  stock_theorique REAL NOT NULL DEFAULT 0,
  UNIQUE(mama_id, nom),
  FOREIGN KEY(zone_id) REFERENCES inventaire_zones(id)
);

-- Table des factures
CREATE TABLE IF NOT EXISTS factures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fournisseur_id INTEGER NOT NULL,
  date_iso TEXT NOT NULL,
  FOREIGN KEY(fournisseur_id) REFERENCES fournisseurs(id)
);

-- Table des lignes de facture
CREATE TABLE IF NOT EXISTS facture_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  facture_id INTEGER NOT NULL,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  prix_unitaire REAL NOT NULL,
  FOREIGN KEY(facture_id) REFERENCES factures(id),
  FOREIGN KEY(produit_id) REFERENCES produits(id)
);

-- Table des périodes comptables
CREATE TABLE IF NOT EXISTS periodes_comptables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mama_id TEXT NOT NULL,
  debut TEXT NOT NULL,
  fin TEXT NOT NULL,
  cloturee INTEGER NOT NULL DEFAULT 0,
  actif INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_periodes_mama ON periodes_comptables(mama_id, debut);

-- Table des règles d'alertes
CREATE TABLE IF NOT EXISTS regles_alertes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mama_id TEXT NOT NULL,
  produit_id INTEGER NOT NULL,
  threshold REAL NOT NULL,
  actif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY(produit_id) REFERENCES produits(id)
);

-- Table d'onboarding
CREATE TABLE IF NOT EXISTS etapes_onboarding (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mama_id TEXT NOT NULL,
  etape TEXT NOT NULL,
  statut TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Table des fiches techniques
CREATE TABLE IF NOT EXISTS fiches_techniques (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mama_id TEXT NOT NULL,
  nom TEXT NOT NULL,
  famille_id INTEGER,
  portions REAL DEFAULT 1,
  cout_total REAL DEFAULT 0,
  cout_par_portion REAL DEFAULT 0,
  prix_vente REAL DEFAULT 0,
  actif INTEGER NOT NULL DEFAULT 1,
  UNIQUE(mama_id, nom),
  FOREIGN KEY(famille_id) REFERENCES familles(id)
);

-- Lignes des fiches techniques
CREATE TABLE IF NOT EXISTS fiche_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fiche_id INTEGER NOT NULL,
  produit_id INTEGER,
  sous_fiche_id INTEGER,
  quantite REAL NOT NULL,
  mama_id TEXT NOT NULL,
  FOREIGN KEY(fiche_id) REFERENCES fiches_techniques(id),
  FOREIGN KEY(produit_id) REFERENCES produits(id),
  FOREIGN KEY(sous_fiche_id) REFERENCES fiches_techniques(id)
);

CREATE INDEX IF NOT EXISTS idx_fiches_mama ON fiches_techniques(mama_id, nom);
CREATE INDEX IF NOT EXISTS idx_fiche_lignes_fiche ON fiche_lignes(fiche_id);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_fournisseurs_nom ON fournisseurs(nom);
CREATE INDEX IF NOT EXISTS idx_produits_nom ON produits(mama_id, nom);
CREATE INDEX IF NOT EXISTS idx_produits_zone ON produits(zone_id);
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_iso);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_produit ON facture_lignes(produit_id);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture ON facture_lignes(facture_id);
CREATE INDEX IF NOT EXISTS idx_alertes_mama ON regles_alertes(mama_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_user ON etapes_onboarding(user_id, mama_id);

-- Trigger: mise à jour du PMP et du stock lors de l'insertion d'une ligne de facture
CREATE TRIGGER IF NOT EXISTS trg_facture_ligne_insert
AFTER INSERT ON facture_lignes
BEGIN
  UPDATE produits SET
    pmp = CASE
      WHEN stock_theorique + NEW.quantite = 0 THEN pmp
      ELSE ((pmp * stock_theorique) + (NEW.prix_unitaire * NEW.quantite)) / (stock_theorique + NEW.quantite)
    END,
    stock_theorique = stock_theorique + NEW.quantite
  WHERE id = NEW.produit_id;
END;

-- Trigger: mise à jour du stock lors de la modification d'une ligne de facture
CREATE TRIGGER IF NOT EXISTS trg_facture_ligne_update
AFTER UPDATE ON facture_lignes
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - OLD.quantite + NEW.quantite
  WHERE id = NEW.produit_id;
END;

-- Trigger: mise à jour du stock lors de la suppression d'une ligne de facture
CREATE TRIGGER IF NOT EXISTS trg_facture_ligne_delete
AFTER DELETE ON facture_lignes
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - OLD.quantite
  WHERE id = OLD.produit_id;
END;

-- Table des ventes de fiches pour le Menu Engineering
CREATE TABLE IF NOT EXISTS ventes_fiches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mama_id TEXT NOT NULL,
  fiche_id INTEGER NOT NULL,
  date_vente TEXT NOT NULL,
  quantite REAL NOT NULL,
  prix_vente_unitaire REAL,
  UNIQUE(mama_id, fiche_id, date_vente),
  FOREIGN KEY(fiche_id) REFERENCES fiches_techniques(id)
);

CREATE INDEX IF NOT EXISTS idx_ventes_fiches_mama_date ON ventes_fiches(mama_id, date_vente);

-- Tableaux de bord et gadgets
CREATE TABLE IF NOT EXISTS tableaux_de_bord (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  utilisateur_id TEXT NOT NULL,
  mama_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gadgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tableau_id INTEGER NOT NULL,
  config TEXT,
  ordre INTEGER DEFAULT 0,
  mama_id TEXT NOT NULL,
  FOREIGN KEY(tableau_id) REFERENCES tableaux_de_bord(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gadgets_tableau ON gadgets(tableau_id);

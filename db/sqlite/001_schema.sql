-- Base SQLite locale pour MamaStock
PRAGMA journal_mode=WAL;

-- Table de version du schéma pour idempotence
CREATE TABLE IF NOT EXISTS meta (
  schema_version TEXT PRIMARY KEY
);

-- Table des migrations (historique des migrations appliquées)
CREATE TABLE IF NOT EXISTS __migrations__ (
  filename TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

INSERT INTO meta(schema_version)
  SELECT '1'
  WHERE NOT EXISTS (SELECT 1 FROM meta);

-- Paramétrage: unités de mesure
CREATE TABLE IF NOT EXISTS unites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  abbr TEXT,
  actif INTEGER NOT NULL DEFAULT 1
);

-- Paramétrage: familles de produits
CREATE TABLE IF NOT EXISTS familles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  actif INTEGER NOT NULL DEFAULT 1
);

-- Paramétrage: sous-familles de produits
CREATE TABLE IF NOT EXISTS sous_familles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  famille_id INTEGER NOT NULL,
  nom TEXT NOT NULL,
  actif INTEGER NOT NULL DEFAULT 1,
  UNIQUE(famille_id, nom),
  FOREIGN KEY(famille_id) REFERENCES familles(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Paramétrage: zones d'inventaire
CREATE TABLE IF NOT EXISTS inventaire_zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  actif INTEGER NOT NULL DEFAULT 1
);

-- Coeur: utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  actif INTEGER NOT NULL DEFAULT 1
);

-- Coeur: fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  email TEXT,
  actif INTEGER NOT NULL DEFAULT 1
);

-- Coeur: produits
CREATE TABLE IF NOT EXISTS produits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  actif INTEGER NOT NULL DEFAULT 1,
  pmp REAL NOT NULL DEFAULT 0,
  stock_theorique REAL NOT NULL DEFAULT 0,
  valeur_stock REAL NOT NULL DEFAULT 0,
  stock_min REAL NOT NULL DEFAULT 0,
  unite_id INTEGER,
  famille_id INTEGER,
  sous_famille_id INTEGER,
  zone_id INTEGER,
  FOREIGN KEY(unite_id) REFERENCES unites(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY(famille_id) REFERENCES familles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY(sous_famille_id) REFERENCES sous_familles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY(zone_id) REFERENCES inventaire_zones(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Flux: factures
CREATE TABLE IF NOT EXISTS factures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fournisseur_id INTEGER NOT NULL,
  date_iso TEXT NOT NULL,
  FOREIGN KEY(fournisseur_id) REFERENCES fournisseurs(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS facture_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  facture_id INTEGER NOT NULL,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  prix_unitaire REAL NOT NULL,
  FOREIGN KEY(facture_id) REFERENCES factures(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(produit_id) REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Inventaires
CREATE TABLE IF NOT EXISTS inventaires (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_iso TEXT NOT NULL,
  zone_id INTEGER,
  reference TEXT,
  cloture INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(zone_id) REFERENCES inventaire_zones(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inventaire_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inventaire_id INTEGER NOT NULL,
  produit_id INTEGER NOT NULL,
  quantite_reelle REAL NOT NULL,
  quantite_theorique REAL NOT NULL DEFAULT 0,
  FOREIGN KEY(inventaire_id) REFERENCES inventaires(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(produit_id) REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Réquisitions
CREATE TABLE IF NOT EXISTS requisitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_iso TEXT NOT NULL,
  reference TEXT
);

CREATE TABLE IF NOT EXISTS requisition_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisition_id INTEGER NOT NULL,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  FOREIGN KEY(requisition_id) REFERENCES requisitions(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(produit_id) REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Recettes
CREATE TABLE IF NOT EXISTS recettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  actif INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS recette_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recette_id INTEGER NOT NULL,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  FOREIGN KEY(recette_id) REFERENCES recettes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(produit_id) REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Menus
CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_iso TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS menu_recettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id INTEGER NOT NULL,
  recette_id INTEGER NOT NULL,
  portions REAL NOT NULL DEFAULT 1,
  FOREIGN KEY(menu_id) REFERENCES menus(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(recette_id) REFERENCES recettes(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tâches
CREATE TABLE IF NOT EXISTS taches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  description TEXT,
  priorite INTEGER NOT NULL DEFAULT 0,
  date_echeance TEXT,
  statut TEXT NOT NULL DEFAULT 'ouvert',
  utilisateur_id INTEGER,
  FOREIGN KEY(utilisateur_id) REFERENCES utilisateurs(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Achats recommandés
CREATE TABLE IF NOT EXISTS achats_recommandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produit_id INTEGER NOT NULL,
  quantite REAL NOT NULL,
  raison TEXT,
  genere_le TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(produit_id) REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Index
CREATE INDEX IF NOT EXISTS idx_fournisseurs_nom ON fournisseurs(nom);
CREATE INDEX IF NOT EXISTS idx_produits_nom ON produits(nom);
CREATE INDEX IF NOT EXISTS idx_produits_famille ON produits(famille_id);
CREATE INDEX IF NOT EXISTS idx_produits_sous_famille ON produits(sous_famille_id);
CREATE INDEX IF NOT EXISTS idx_produits_unite ON produits(unite_id);
CREATE INDEX IF NOT EXISTS idx_produits_zone ON produits(zone_id);
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_iso);
CREATE INDEX IF NOT EXISTS idx_factures_fournisseur ON factures(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture ON facture_lignes(facture_id);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_produit ON facture_lignes(produit_id);
CREATE INDEX IF NOT EXISTS idx_inventaires_date ON inventaires(date_iso);
CREATE INDEX IF NOT EXISTS idx_inventaires_zone ON inventaires(zone_id);
CREATE INDEX IF NOT EXISTS idx_inventaire_lignes_inv ON inventaire_lignes(inventaire_id);
CREATE INDEX IF NOT EXISTS idx_inventaire_lignes_prod ON inventaire_lignes(produit_id);
CREATE INDEX IF NOT EXISTS idx_requisitions_date ON requisitions(date_iso);
CREATE INDEX IF NOT EXISTS idx_requisition_lignes_req ON requisition_lignes(requisition_id);
CREATE INDEX IF NOT EXISTS idx_requisition_lignes_prod ON requisition_lignes(produit_id);
CREATE INDEX IF NOT EXISTS idx_recettes_nom ON recettes(nom);
CREATE INDEX IF NOT EXISTS idx_recette_lignes_recette ON recette_lignes(recette_id);
CREATE INDEX IF NOT EXISTS idx_recette_lignes_produit ON recette_lignes(produit_id);
CREATE INDEX IF NOT EXISTS idx_menus_date ON menus(date_iso);
CREATE INDEX IF NOT EXISTS idx_menu_recettes_menu ON menu_recettes(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_recettes_recette ON menu_recettes(recette_id);
CREATE INDEX IF NOT EXISTS idx_taches_statut ON taches(statut);
CREATE INDEX IF NOT EXISTS idx_taches_utilisateur ON taches(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_achats_rec_produit ON achats_recommandes(produit_id);

-- Triggers de gestion du stock et du PMP
DROP TRIGGER IF EXISTS trg_facture_ligne_insert;
CREATE TRIGGER IF NOT EXISTS trg_facture_ligne_insert
AFTER INSERT ON facture_lignes
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique + NEW.quantite,
    valeur_stock = valeur_stock + (NEW.quantite * NEW.prix_unitaire),
    pmp = CASE
      WHEN stock_theorique + NEW.quantite = 0 THEN 0
      ELSE (valeur_stock + (NEW.quantite * NEW.prix_unitaire)) / (stock_theorique + NEW.quantite)
    END
  WHERE id = NEW.produit_id;
END;

DROP TRIGGER IF EXISTS trg_facture_ligne_update;
CREATE TRIGGER IF NOT EXISTS trg_facture_ligne_update
AFTER UPDATE ON facture_lignes
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - OLD.quantite + NEW.quantite,
    valeur_stock = valeur_stock - (OLD.quantite * OLD.prix_unitaire) + (NEW.quantite * NEW.prix_unitaire),
    pmp = CASE
      WHEN stock_theorique - OLD.quantite + NEW.quantite = 0 THEN 0
      ELSE (valeur_stock - (OLD.quantite * OLD.prix_unitaire) + (NEW.quantite * NEW.prix_unitaire)) /
           (stock_theorique - OLD.quantite + NEW.quantite)
    END
  WHERE id = NEW.produit_id;
END;

DROP TRIGGER IF EXISTS trg_facture_ligne_delete;
CREATE TRIGGER IF NOT EXISTS trg_facture_ligne_delete
AFTER DELETE ON facture_lignes
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - OLD.quantite,
    valeur_stock = valeur_stock - (OLD.quantite * OLD.prix_unitaire),
    pmp = CASE
      WHEN stock_theorique - OLD.quantite = 0 THEN 0
      ELSE (valeur_stock - (OLD.quantite * OLD.prix_unitaire)) / (stock_theorique - OLD.quantite)
    END
  WHERE id = OLD.produit_id;
END;

DROP TRIGGER IF EXISTS trg_inventaire_ligne_insert;
CREATE TRIGGER IF NOT EXISTS trg_inventaire_ligne_insert
AFTER INSERT ON inventaire_lignes
BEGIN
  UPDATE produits SET
    stock_theorique = NEW.quantite_reelle,
    valeur_stock = NEW.quantite_reelle * pmp
  WHERE id = NEW.produit_id;
END;

DROP TRIGGER IF EXISTS trg_requisition_ligne_insert;
CREATE TRIGGER IF NOT EXISTS trg_requisition_ligne_insert
AFTER INSERT ON requisition_lignes
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - NEW.quantite,
    valeur_stock = valeur_stock - (NEW.quantite * pmp)
  WHERE id = NEW.produit_id;
END;

-- Vues de coûts et KPI
CREATE VIEW IF NOT EXISTS v_produits_stock AS
SELECT id, nom, pmp, stock_theorique, valeur_stock, stock_min
FROM produits;

CREATE VIEW IF NOT EXISTS v_recette_cout AS
SELECT r.id AS recette_id,
       r.nom,
       IFNULL(SUM(p.pmp * rl.quantite), 0) AS cout_unitaire
FROM recettes r
LEFT JOIN recette_lignes rl ON rl.recette_id = r.id
LEFT JOIN produits p ON p.id = rl.produit_id
GROUP BY r.id, r.nom;

CREATE VIEW IF NOT EXISTS v_menu_cout AS
SELECT m.id AS menu_id,
       m.date_iso,
       IFNULL(SUM(vrc.cout_unitaire * mr.portions), 0) AS cout_total
FROM menus m
LEFT JOIN menu_recettes mr ON mr.menu_id = m.id
LEFT JOIN v_recette_cout vrc ON vrc.recette_id = mr.recette_id
GROUP BY m.id, m.date_iso;

CREATE VIEW IF NOT EXISTS v_dashboard_kpi AS
SELECT
  (SELECT IFNULL(SUM(valeur_stock), 0) FROM produits) AS stock_valorise,
  (SELECT COUNT(*) FROM produits WHERE stock_theorique < stock_min) AS nb_alertes_stock,
  (SELECT COUNT(*) FROM taches WHERE statut = 'ouvert') AS nb_taches_ouvertes,
  (SELECT COUNT(*) FROM achats_recommandes) AS achats_reco_en_attente;

-- Silence les NOTICE (ex: DROP IF EXISTS)
SET client_min_messages = WARNING;

-- Côté Neon, reste dans le schéma public
-- Optionnel si tu veux des UUID:
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tables paramétrage
CREATE TABLE IF NOT EXISTS unites (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  abbr TEXT,
  actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS familles (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sous_familles (
  id BIGSERIAL PRIMARY KEY,
  famille_id BIGINT NOT NULL REFERENCES familles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nom TEXT NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (famille_id, nom)
);

CREATE TABLE IF NOT EXISTS inventaire_zones (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  actif BOOLEAN NOT NULL DEFAULT TRUE
);

-- Cœur
CREATE TABLE IF NOT EXISTS utilisateurs (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS fournisseurs (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  email TEXT,
  actif BOOLEAN NOT NULL DEFAULT TRUE
);

-- NUMERIC pour éviter les erreurs d’arrondi
CREATE TABLE IF NOT EXISTS produits (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  pmp NUMERIC(14,6) NOT NULL DEFAULT 0,
  stock_theorique NUMERIC(14,6) NOT NULL DEFAULT 0,
  valeur_stock NUMERIC(18,6) NOT NULL DEFAULT 0,
  stock_min NUMERIC(14,6) NOT NULL DEFAULT 0,
  unite_id BIGINT REFERENCES unites(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  famille_id BIGINT REFERENCES familles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  sous_famille_id BIGINT REFERENCES sous_familles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  zone_id BIGINT REFERENCES inventaire_zones(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Flux
CREATE TABLE IF NOT EXISTS factures (
  id BIGSERIAL PRIMARY KEY,
  fournisseur_id BIGINT NOT NULL REFERENCES fournisseurs(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  date_iso DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS facture_lignes (
  id BIGSERIAL PRIMARY KEY,
  facture_id BIGINT NOT NULL REFERENCES factures(id) ON UPDATE CASCADE ON DELETE CASCADE,
  produit_id BIGINT NOT NULL REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantite NUMERIC(14,6) NOT NULL,
  prix_unitaire NUMERIC(14,6) NOT NULL
);

-- Inventaires
CREATE TABLE IF NOT EXISTS inventaires (
  id BIGSERIAL PRIMARY KEY,
  date_iso DATE NOT NULL,
  zone_id BIGINT REFERENCES inventaire_zones(id) ON UPDATE CASCADE ON DELETE SET NULL,
  reference TEXT,
  cloture BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS inventaire_lignes (
  id BIGSERIAL PRIMARY KEY,
  inventaire_id BIGINT NOT NULL REFERENCES inventaires(id) ON UPDATE CASCADE ON DELETE CASCADE,
  produit_id BIGINT NOT NULL REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantite_reelle NUMERIC(14,6) NOT NULL,
  quantite_theorique NUMERIC(14,6) NOT NULL DEFAULT 0
);

-- Réquisitions
CREATE TABLE IF NOT EXISTS requisitions (
  id BIGSERIAL PRIMARY KEY,
  date_iso DATE NOT NULL,
  reference TEXT
);

CREATE TABLE IF NOT EXISTS requisition_lignes (
  id BIGSERIAL PRIMARY KEY,
  requisition_id BIGINT NOT NULL REFERENCES requisitions(id) ON UPDATE CASCADE ON DELETE CASCADE,
  produit_id BIGINT NOT NULL REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantite NUMERIC(14,6) NOT NULL
);

-- Recettes / Menus
CREATE TABLE IF NOT EXISTS recettes (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS recette_lignes (
  id BIGSERIAL PRIMARY KEY,
  recette_id BIGINT NOT NULL REFERENCES recettes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  produit_id BIGINT NOT NULL REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantite NUMERIC(14,6) NOT NULL
);

CREATE TABLE IF NOT EXISTS menus (
  id BIGSERIAL PRIMARY KEY,
  date_iso DATE NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS menu_recettes (
  id BIGSERIAL PRIMARY KEY,
  menu_id BIGINT NOT NULL REFERENCES menus(id) ON UPDATE CASCADE ON DELETE CASCADE,
  recette_id BIGINT NOT NULL REFERENCES recettes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  portions NUMERIC(14,6) NOT NULL DEFAULT 1
);

-- Tâches & achats reco
CREATE TABLE IF NOT EXISTS taches (
  id BIGSERIAL PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  priorite INTEGER NOT NULL DEFAULT 0,
  date_echeance DATE,
  statut TEXT NOT NULL DEFAULT 'ouvert',
  utilisateur_id BIGINT REFERENCES utilisateurs(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS achats_recommandes (
  id BIGSERIAL PRIMARY KEY,
  produit_id BIGINT NOT NULL REFERENCES produits(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantite NUMERIC(14,6) NOT NULL,
  raison TEXT,
  genere_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index (équivalents PG)
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

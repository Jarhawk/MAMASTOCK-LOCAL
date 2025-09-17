-- migrations/postgres/0001_init.sql
-- Exemple basique : tables "produits" et "fournisseurs". Adapte selon ton schéma réel.
CREATE TABLE IF NOT EXISTS produits (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  libelle TEXT NOT NULL,
  prix NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fournisseurs (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

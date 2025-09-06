-- Ajoute colonnes d'authentification locale
ALTER TABLE utilisateurs ADD COLUMN mot_de_passe_hash TEXT;
ALTER TABLE utilisateurs ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE utilisateurs ADD COLUMN actif INTEGER DEFAULT 1;

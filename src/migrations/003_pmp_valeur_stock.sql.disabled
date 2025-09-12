-- Migration 003 : ajout de la valeur du stock et triggers complets
ALTER TABLE produits ADD COLUMN valeur_stock REAL NOT NULL DEFAULT 0;

-- Recréation des triggers pour gérer stock, valeur du stock et PMP
DROP TRIGGER IF EXISTS trg_facture_ligne_insert;
DROP TRIGGER IF EXISTS trg_facture_ligne_update;
DROP TRIGGER IF EXISTS trg_facture_ligne_delete;

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

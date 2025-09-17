-- Vues coûts & KPI (COALESCE à la place de IFNULL)
CREATE OR REPLACE VIEW v_produits_stock AS
SELECT id, nom, pmp, stock_theorique, valeur_stock, stock_min
FROM produits;

CREATE OR REPLACE VIEW v_recette_cout AS
SELECT r.id AS recette_id,
       r.nom,
       COALESCE(SUM(p.pmp * rl.quantite), 0)::NUMERIC(18,6) AS cout_unitaire
FROM recettes r
LEFT JOIN recette_lignes rl ON rl.recette_id = r.id
LEFT JOIN produits p ON p.id = rl.produit_id
GROUP BY r.id, r.nom;

CREATE OR REPLACE VIEW v_menu_cout AS
SELECT m.id AS menu_id,
       m.date_iso,
       COALESCE(SUM(vrc.cout_unitaire * mr.portions), 0)::NUMERIC(18,6) AS cout_total
FROM menus m
LEFT JOIN menu_recettes mr ON mr.menu_id = m.id
LEFT JOIN v_recette_cout vrc ON vrc.recette_id = mr.recette_id
GROUP BY m.id, m.date_iso;

CREATE OR REPLACE VIEW v_dashboard_kpi AS
SELECT
  COALESCE((SELECT SUM(valeur_stock) FROM produits), 0) AS stock_valorise,
  (SELECT COUNT(*) FROM produits WHERE stock_theorique < stock_min) AS nb_alertes_stock,
  (SELECT COUNT(*) FROM taches WHERE statut = 'ouvert') AS nb_taches_ouvertes,
  (SELECT COUNT(*) FROM achats_recommandes) AS achats_reco_en_attente;

-- Triggers équivalents (INSERT/UPDATE/DELETE sur facture_lignes)
CREATE OR REPLACE FUNCTION fn_facture_ligne_after_insert() RETURNS TRIGGER AS $$
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique + NEW.quantite,
    valeur_stock    = valeur_stock + (NEW.quantite * NEW.prix_unitaire),
    pmp = CASE
      WHEN (stock_theorique + NEW.quantite) = 0 THEN 0
      ELSE (valeur_stock + (NEW.quantite * NEW.prix_unitaire)) / (stock_theorique + NEW.quantite)
    END
  WHERE id = NEW.produit_id;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_facture_ligne_after_update() RETURNS TRIGGER AS $$
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - OLD.quantite + NEW.quantite,
    valeur_stock    = valeur_stock - (OLD.quantite * OLD.prix_unitaire) + (NEW.quantite * NEW.prix_unitaire),
    pmp = CASE
      WHEN (stock_theorique - OLD.quantite + NEW.quantite) = 0 THEN 0
      ELSE (valeur_stock - (OLD.quantite * OLD.prix_unitaire) + (NEW.quantite * NEW.prix_unitaire))
           / (stock_theorique - OLD.quantite + NEW.quantite)
    END
  WHERE id = NEW.produit_id;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_facture_ligne_after_delete() RETURNS TRIGGER AS $$
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - OLD.quantite,
    valeur_stock    = valeur_stock - (OLD.quantite * OLD.prix_unitaire),
    pmp = CASE
      WHEN (stock_theorique - OLD.quantite) = 0 THEN 0
      ELSE (valeur_stock - (OLD.quantite * OLD.prix_unitaire)) / (stock_theorique - OLD.quantite)
    END
  WHERE id = OLD.produit_id;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_facture_ligne_insert ON facture_lignes;
CREATE TRIGGER trg_facture_ligne_insert
AFTER INSERT ON facture_lignes
FOR EACH ROW EXECUTE FUNCTION fn_facture_ligne_after_insert();

DROP TRIGGER IF EXISTS trg_facture_ligne_update ON facture_lignes;
CREATE TRIGGER trg_facture_ligne_update
AFTER UPDATE ON facture_lignes
FOR EACH ROW EXECUTE FUNCTION fn_facture_ligne_after_update();

DROP TRIGGER IF EXISTS trg_facture_ligne_delete ON facture_lignes;
CREATE TRIGGER trg_facture_ligne_delete
AFTER DELETE ON facture_lignes
FOR EACH ROW EXECUTE FUNCTION fn_facture_ligne_after_delete();

-- Inventaire → remet le stock à la réalité
CREATE OR REPLACE FUNCTION fn_inventaire_ligne_after_insert() RETURNS TRIGGER AS $$
BEGIN
  UPDATE produits SET
    stock_theorique = NEW.quantite_reelle,
    valeur_stock    = NEW.quantite_reelle * pmp
  WHERE id = NEW.produit_id;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventaire_ligne_insert ON inventaire_lignes;
CREATE TRIGGER trg_inventaire_ligne_insert
AFTER INSERT ON inventaire_lignes
FOR EACH ROW EXECUTE FUNCTION fn_inventaire_ligne_after_insert();

-- Réquisition → décrémente
CREATE OR REPLACE FUNCTION fn_requisition_ligne_after_insert() RETURNS TRIGGER AS $$
BEGIN
  UPDATE produits SET
    stock_theorique = stock_theorique - NEW.quantite,
    valeur_stock    = valeur_stock - (NEW.quantite * pmp)
  WHERE id = NEW.produit_id;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requisition_ligne_insert ON requisition_lignes;
CREATE TRIGGER trg_requisition_ligne_insert
AFTER INSERT ON requisition_lignes
FOR EACH ROW EXECUTE FUNCTION fn_requisition_ligne_after_insert();

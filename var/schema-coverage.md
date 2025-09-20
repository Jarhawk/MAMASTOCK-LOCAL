# Schéma SQLite – Couverture

- Fichiers scannés : 570
- Appels backend distant détectés : 0
- Tables ajoutées : __migrations__, unites, familles, sous_familles, inventaire_zones, inventaires, inventaire_lignes, requisitions, requisition_lignes, recettes, recette_lignes, menus, menu_recettes, taches, achats_recommandes
- Colonnes ajoutées : produits.valeur_stock, produits.unite_id, produits.famille_id, produits.sous_famille_id, produits.stock_min, produits.zone_id
- Index ajoutés : idx_produits_famille, idx_produits_sous_famille, idx_produits_unite, idx_produits_zone, idx_inventaire_lignes_inv, idx_inventaire_lignes_prod, idx_requisition_lignes_req, idx_requisition_lignes_prod, idx_recette_lignes_recette, idx_recette_lignes_produit, idx_menu_recettes_menu, idx_menu_recettes_recette, idx_taches_statut, idx_taches_utilisateur, idx_achats_rec_produit
- Triggers ajoutés : trg_facture_ligne_insert, trg_facture_ligne_update, trg_facture_ligne_delete, trg_inventaire_ligne_insert, trg_requisition_ligne_insert
- Restes/TODO : aucun

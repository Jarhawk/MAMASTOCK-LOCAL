# Rapport d'alignement front ↔ back local

Ce rapport recense les entités de données observées dans le code front (`src/**/*.{js,jsx,ts,tsx}` et `public/*`). Il sert de base pour la construction du schéma SQLite local.

## Tables détectées

### utilisateurs
- Colonnes observées : `id`, `email`, `mot_de_passe_hash`, `role`, `actif`
- Utilisation : authentification locale.
- Statut : **à créer**

### fournisseurs
- Colonnes observées : `id`, `nom`, `email`, `actif`
- Utilisation : sélection d'un fournisseur, import produits.
- Statut : **à créer**

### produits
- Colonnes observées : `id`, `nom`, `unite`, `famille`, `actif`, `pmp`, `stock_theorique`
- Relations : `fournisseur_id → fournisseurs.id`
- Utilisation : listings, sélection dans factures/fiches.
- Statut : **à créer**

### factures
- Colonnes observées : `id`, `fournisseur_id`, `date_iso`
- Relations : `fournisseur_id → fournisseurs.id`
- Utilisation : création d'achats et calcul de stock.
- Statut : **à créer**

### facture_lignes
- Colonnes observées : `id`, `facture_id`, `produit_id`, `quantite`, `prix_unitaire`
- Relations : `facture_id → factures.id`, `produit_id → produits.id`
- Utilisation : détail des achats, mise à jour PMP et stock.
- Statut : **à créer**

### Autres entités mentionnées
De nombreuses autres tables (≈122) sont référencées dans le code (`familles`, `fiches_techniques`, `taches`, `transferts`, etc.). Elles ne sont pas encore prises en charge par ce backend local et devront être spécifiées lors de futures itérations.

## Décisions de normalisation
- `produits.nom` et `fournisseurs.nom` marqués `UNIQUE` pour éviter les doublons.
- Utilisation systématique d'identifiants entiers (`INTEGER PRIMARY KEY`).
- Colonne booléenne `actif` stockée sous forme `INTEGER` (0/1).

## Incompatibilités front ↔ data
- La majorité du front dépend encore de Supabase ; seules les fonctionnalités de gestion des produits/fournisseurs/factures sont couvertes par cette première version locale.
- Les mises à jour de lignes de facture ne recalculent pas exactement le PMP ; la stratégie recommandée consiste à supprimer puis recréer la ligne lors d'une édition.


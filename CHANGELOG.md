# Changelog

## 1.0.0 - 2025-09-07

### Added
- Migration vers Tauri v2 et purge Supabase/Postgres.
- Base SQLite locale avec `valeur_stock` et triggers pour stock/PMP.
- Authentification locale (bcrypt) avec script `seed-admin`.
- DAL SQLite pour produits, fournisseurs et factures.
- Paramétrage du dossier de données avec verrou distribué et auto-fermeture des instances concurrentes.
- Exports locaux (CSV, XLSX, PDF).
- Sauvegarde, restauration et maintenance de la base via l'interface.
- Workflows CI Windows générant un installateur MSI.
- Branding : logo vectoriel et génération d'icônes automatisée.

### Breaking changes
- Aucun.

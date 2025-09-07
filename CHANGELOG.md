# Changelog

## 1.0.0 - 2025-09-07

### Added
- Migration vers Tauri v2.
- Base SQLite locale avec `valeur_stock` et triggers INSERT/UPDATE/DELETE pour le stock et le PMP.
- Authentification locale (bcrypt) avec script `seed-admin`.
- DAL SQLite pour produits, fournisseurs et factures.
- Paramétrage du dossier de données.
- Verrou distribué avec auto-fermeture des instances concurrentes.
- Exports locaux (CSV, XLSX, PDF).
- Sauvegarde et restauration de la base via l'interface.
- Workflows CI Windows générant un installateur MSI.
- Branding : logo vectoriel et icônes générées automatiquement.

### Breaking changes
- Aucun.

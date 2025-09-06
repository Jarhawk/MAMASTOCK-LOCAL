# Project Status

This document tracks the global progress of the project.

## Checklist

### Fait
- Initial setup
- SQLite migrations (valeur_stock + triggers) et scripts db:apply/db:smoke
- Migration vers Tauri v2 + purge Supabase/PG
- Authentification locale (bcrypt) avec page Login et script seed-admin
- DAL SQLite pour Produits/Fournisseurs/Factures
- Paramétrage du dossier de données avec verrou distribué et auto‑fermeture
- Workflows CI: vérification des PR (build + db:smoke) et release Windows via tag `v*`
- Sauvegarde/restauration/maintenance SQLite via interface

### En cours
- TBD

### À faire
- TBD

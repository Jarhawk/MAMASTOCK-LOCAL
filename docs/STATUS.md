# Project Status

This document tracks the global progress of the project.

## Checklist

### Fait
- Initial setup
- SQLite migrations (valeur_stock + triggers) et scripts db:apply/db:smoke
- Migration vers Tauri v2 + purge backend cloud/PG
- Authentification locale (bcrypt) avec page Login et script seed-admin
- DAL SQLite pour Produits/Fournisseurs/Factures
- Paramétrage du dossier de données avec verrou distribué et auto‑fermeture
- Workflows CI: vérification des PR (build + db:smoke) et release Windows via tag `v*`
- Sauvegarde/restauration/maintenance SQLite via interface
- Exports locaux (CSV/XLSX/PDF) pour produits, fournisseurs et factures via plugins fs/dialog/path v2
- Logo vectoriel et génération d'icônes Tauri automatisée à la build (CI + build.ps1)
- Pluginisation Tauri v2 (process/fs/dialog/path) et script de vérification des imports
- Script doctor (Node/Rust/migrations/plugins v2) et guide QA
- Résolution des plugins Tauri v2 via npm (path/fs/dialog/process) et suppression du stub local
- Alias '@' unifié pour Vite/Vitest/TS avec fallback Node et tests d'export stabilisés
- Passage à `@tauri-apps/api/path` avec suppression du faux plugin path et mise à jour du script d'interdiction d'import
- Durcissement Windows uniquement : workflows CI Windows, bundle MSI, build.ps1 et documentation dédiés
- Préparation de la première release Windows 1.0.0 : changelog initial, guide QA et instructions de publication
- Forçage du toolchain Rust MSVC et avertissement en cas de présence de MSYS/MinGW
- Ajout du plugin dialog v2 et mise à jour du script de vérification des imports
- Migration du plugin SQL vers le Builder v2 avec permissions dédiées et build Windows revalidé
- Sanity finale Windows : extension du script doctor (plugin SQL + capacités) et rappel du guide de publication
- Enforcement final Windows : workflows CI et release exclusivement Windows, doctor vérifiant Node/npm/Rust/VS Build Tools/WebView2/migrations
- Vérification MSVC/SDK : build.ps1 et CI installent VS Build Tools + Windows 11 SDK et vérifient `lib.exe` pour éviter « lib.exe not found »
- Exécution forcée Windows : workflows assertent Windows, build.ps1 bloque WSL/Git Bash et la doc impose PowerShell
- Configuration ESLint standardisée (React/TS) et script lint mis à jour
- Finalisation release Windows 1.0.0 : rappel QA, publication via tag `v1.0.0` et vérification de l’artefact MSI
- Stabilisation du build Windows : caches npm/cargo, timeout allongé et logs détaillés (CI + transcript PowerShell)
- Script postinstall-check : valeurs par défaut pour les chemins et vérifications non bloquantes de `config.json` et `mamastock.db`
- Hard-forcing MSVC target et purge des variables Linux/MinGW (build.ps1 + CI)
- Icône MSI sans binaires : logo SVG unique et génération d'icônes au build (local `npm run tauri:build`, CI étape "Generate icons")

### En cours
- TBD

### À faire
- TBD

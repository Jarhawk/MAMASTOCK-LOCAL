# PR-022-WIN Report

## Résumé
Correction de l'initialisation du plugin SQL pour Tauri v2, ajout des permissions SQL et revalidation du build Windows.

## Fichiers ajoutés/modifiés/supprimés
- src-tauri/src/main.rs
- src-tauri/capabilities/sql.json
- docs/STATUS.md
- docs/reports/PR-022-WIN_report.md
- docs/reports/PR-022-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run build
npm run db:smoke
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Aucun.

## Impact utilisateur
- Plugin SQL Tauri v2 correctement initialisé avec permissions dédiées.

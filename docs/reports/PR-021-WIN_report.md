# PR-021-WIN Report

## Résumé
Ajout d'un contrôle interdisant l'ancien module `@tauri-apps/api/dialog` et mise à jour de la documentation.

## Fichiers ajoutés/modifiés/supprimés
- docs/STATUS.md
- scripts/check-tauri-imports.js
- docs/reports/PR-021-WIN_report.md
- docs/reports/PR-021-WIN_report.json

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
- Les anciens imports `@tauri-apps/api/dialog` sont désormais interdits, garantissant l'utilisation du plugin `@tauri-apps/plugin-dialog`.


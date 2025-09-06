# PR-008 Report

## Résumé
Ajout du logo SVG et génération automatique des icônes lors des builds Tauri, sans versionner les binaires générés.

## Fichiers ajoutés/modifiés/supprimés
- .github/workflows/build-windows.yml
- .github/workflows/verify-local.yml
- .gitignore
- build.ps1
- docs/STATUS.md
- docs/reports/PR-008_report.md
- docs/reports/PR-008_report.json
- package.json
- src-tauri/tauri.conf.json

## Scripts/commandes exécutables pour tester
```bash
npm run icon:gen
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- TBD

## Impact utilisateur
- Icônes générées automatiquement pendant les builds sans stocker de PNG/ICO dans le dépôt.

# PR-008 Report

## Résumé
Ajout du logo SVG et génération automatique des icônes Tauri à la build, sans versionner les PNG/ICO.

## Fichiers ajoutés/modifiés/supprimés
- assets/logo.svg
- package.json
- build.ps1
- .github/workflows/build-windows.yml
- src-tauri/tauri.conf.json
- .gitignore
- docs/STATUS.md
- docs/reports/PR-008_report.md
- docs/reports/PR-008_report.json

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
- Logo vectoriel et icônes générées automatiquement lors des builds Tauri.


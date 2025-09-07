# PR-014 Report

## Résumé
Remplace les icônes binaires par une génération à partir d'un SVG vectoriel et intègre la commande `icon:gen` dans les pipelines et le script de build.

## Fichiers ajoutés/modifiés/supprimés
- assets/logo.svg
- assets/README.md
- package.json
- build.ps1
- .github/workflows/build-windows.yml
- src-tauri/tauri.conf.json
- .gitignore
- docs/STATUS.md
- docs/reports/PR-014_report.md
- docs/reports/PR-014_report.json

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run icon:gen
npm run build
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Aucun

## Impact utilisateur
- Icônes Tauri générées automatiquement à partir du logo vectoriel, réduction de la taille du dépôt.

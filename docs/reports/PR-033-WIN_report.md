# PR-033-WIN Report

## Résumé
Remplace le logo par un SVG texte et génère les icônes Tauri au build sans committer les binaires.

## Fichiers ajoutés/modifiés/supprimés
- assets/logo.svg
- .gitignore
- package.json
- src-tauri/tauri.conf.json
- build.ps1
- .github/workflows/build-windows.yml
- .github/workflows/verify-local.yml
- README.md
- README-offline.md
- docs/STATUS.md
- docs/reports/PR-033-WIN_report.md
- docs/reports/PR-033-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run build
npm run icon:gen
npx tauri --version
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- L'environnement Linux ne produit pas l'installateur MSI.

## Impact utilisateur
- Un seul logo SVG est versionné et toutes les icônes MSI sont générées automatiquement au build ou dans la CI.

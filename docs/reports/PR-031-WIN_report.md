# PR-031-WIN Report

## Résumé
Hard-force Windows MSVC target and purge Linux environment variables in build script and CI.

## Fichiers ajoutés/modifiés/supprimés
- build.ps1
- .github/workflows/build-windows.yml
- .github/workflows/verify-local.yml
- docs/STATUS.md
- docs/reports/PR-031-WIN_report.md
- docs/reports/PR-031-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run build
CARGO_BUILD_TARGET=x86_64-pc-windows-msvc npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Aucun

## Impact utilisateur
- Builds Windows ciblent explicitement MSVC, évitant les fuites d'environnement Linux.

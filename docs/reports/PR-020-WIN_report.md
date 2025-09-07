# PR-020-WIN Report

## Résumé
Forçage du toolchain Rust MSVC et durcissement des builds Windows.

## Fichiers ajoutés/modifiés/supprimés
- build.ps1
- .github/workflows/build-windows.yml
- .github/workflows/verify-local.yml
- docs/QA.md
- docs/STATUS.md
- docs/reports/PR-020-WIN_report.md
- docs/reports/PR-020-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run build
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Aucun.

## Impact utilisateur
- Build Windows plus fiable grâce à l'utilisation exclusive de la toolchain MSVC.


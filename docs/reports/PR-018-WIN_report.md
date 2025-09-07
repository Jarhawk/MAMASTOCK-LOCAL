# PR-018-WIN Report

## Résumé
Durcissement Windows-only: workflows CI Windows, bundle MSI (WebView2 bootstrapper), build script PowerShell et documentation mise à jour.

## Fichiers ajoutés/modifiés/supprimés
- .github/workflows/build-windows.yml
- .github/workflows/front-audit.yml
- .github/workflows/verify-local.yml
- README.md
- README-offline.md
- build.ps1
- docs/STATUS.md
- src-tauri/tauri.conf.json
- docs/reports/PR-018-WIN_report.md
- docs/reports/PR-018-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run build
npm run db:smoke
npm run check:tauri
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Build Tauri échoue faute des bibliothèques système `gio-2.0`.

## Impact utilisateur
- Application Windows 11 uniquement avec installateur MSI et documentation dédiée.

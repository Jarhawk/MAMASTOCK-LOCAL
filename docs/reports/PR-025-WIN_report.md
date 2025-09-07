# PR-025-WIN Report

## Résumé
Durcissement MSVC/SDK : build.ps1 vérifie `lib.exe` via `where.exe` et le workflow CI échoue si l'outil est absent, évitant définitivement « lib.exe not found ».

## Fichiers ajoutés/modifiés/supprimés
- build.ps1
- .github/workflows/build-windows.yml
- README.md
- docs/QA.md
- docs/STATUS.md
- docs/reports/PR-025-WIN_report.md
- docs/reports/PR-025-WIN_report.json

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
- Empêche les erreurs « lib.exe not found » en s'assurant que MSVC et le SDK Windows 11 sont prêts avant le build.

# PR-026-WIN Report

## Résumé
Blocage Linux/WSL : workflows et build.ps1 imposent l'exécution en PowerShell Windows uniquement, documentation ajustée.

## Fichiers ajoutés/modifiés/supprimés
- build.ps1
- .github/workflows/verify-local.yml
- .github/workflows/build-windows.yml
- README.md
- docs/QA.md
- docs/STATUS.md
- docs/reports/PR-026-WIN_report.md
- docs/reports/PR-026-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm test
npm run build
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Aucun.

## Impact utilisateur
- Empêche toute exécution hors Windows et clarifie l'usage exclusif de PowerShell.

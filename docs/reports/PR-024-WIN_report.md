# PR-024-WIN Report

## Résumé
Durcissement Windows : suppression des runners Linux/macOS, PowerShell par défaut et doctor limité à Windows.

## Fichiers ajoutés/modifiés/supprimés
- .github/workflows/verify-local.yml
- .github/workflows/build-windows.yml
- scripts/doctor.ps1
- docs/STATUS.md
- docs/reports/PR-024-WIN_report.md
- docs/reports/PR-024-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm test
npm run lint
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Aucun.

## Impact utilisateur
- Vérifications et releases CI limitées à Windows.
- Script doctor vérifie l'environnement Windows (Node, npm, Rust, VS Build Tools, WebView2, migrations).

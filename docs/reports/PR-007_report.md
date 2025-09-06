# PR-007 Report

## Résumé
Ajout des workflows GitHub pour vérifier les PR (build + db:smoke) et générer les installeurs Windows lors du taggage `v*`, avec documentation du processus.

## Fichiers ajoutés/modifiés/supprimés
- .github/workflows/build-windows.yml
- .github/workflows/verify-local.yml
- README.md
- docs/STATUS.md
- docs/reports/PR-007_report.md
- docs/reports/PR-007_report.json

## Scripts/commandes exécutables pour tester
```bash
npm run build
npm run db:smoke
npm test
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- TBD

## Impact utilisateur
- Vérification automatique des PR et génération d'un installeur Windows à partir d'un tag `v*`.

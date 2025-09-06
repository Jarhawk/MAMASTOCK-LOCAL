# PR-010 Report

## Résumé
Ajout d'exports locaux (CSV/XLSX/PDF) pour les produits, fournisseurs et factures, enregistrés dans un dossier configurabl
e.

## Fichiers ajoutés/modifiés/supprimés
- src/hooks/useExport.js
- src/lib/db.ts
- docs/STATUS.md
- docs/reports/PR-010_report.md
- docs/reports/PR-010_report.json

## Scripts/commandes exécutables pour tester
```bash
npm run build
npm run db:smoke
npm test
node -e "const exp=require('./src/lib/export/exportHelpers.js'); exp.exportToCSV([{a:1}]).catch(e=>console.error(e))"
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- TBD

## Impact utilisateur
- Possibilité d'exporter localement produits, fournisseurs et factures en CSV, XLSX ou PDF.

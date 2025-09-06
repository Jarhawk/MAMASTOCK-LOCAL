# PR-004 Report

## Résumé
Purge des dépendances Supabase/PG, suppression des restes Express et scission de la documentation entre versions locale et cloud.

## Fichiers ajoutés/modifiés/supprimés
- README-cloud.md
- README.md
- package.json
- package-lock.json
- docs/STATUS.md
- src/globals.css
- src/lib/supa/client.ts
- src/lib/supa/textSearch.ts
- src/pages/parametrage/DataFolder.jsx
- src/pages/parametrage/SystemTools.jsx
- src/types/supabase.d.ts
- vite.config.ts
- docs/reports/PR-004_report.md
- docs/reports/PR-004_report.json
- (supprimés) README-offline.md, src/api/public/index.js, src/api/public/produits.js, src/api/public/promotions.js, src/api/public/stock.js

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run build
npm run db:smoke
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Remplacer les appels Supabase restants par un DAL local.

## Impact utilisateur
- Application hors ligne simplifiée avec documentation dédiée; dépendances cloud supprimées.

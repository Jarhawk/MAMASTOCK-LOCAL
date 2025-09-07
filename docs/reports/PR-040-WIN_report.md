# PR-040-WIN Report

## Résumé
Affiche un panneau d'erreur global et écrit les erreurs JS dans un fichier local.

## Fichiers ajoutés/modifiés/supprimés
- src/debug/logger.ts
- src/debug/ErrorBoundary.jsx
- src/components/DebugRibbon.jsx
- src/main.jsx
- src/App.jsx
- README-offline.md
- docs/reports/PR-040-WIN_report.md
- docs/reports/PR-040-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm test
npm run build
```

## Résultats de tests
*(voir rapport JSON)*

Fichier de log : `%APPDATA%\\com.mamastock.local\\logs\\renderer.log`.

## Points encore ouverts
- Aucun.

## Impact utilisateur
- En cas de crash React, un message s'affiche et les erreurs sont loguées sur disque.

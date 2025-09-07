# PR-016 Report

## Résumé
Unifie l'alias `@` entre Vite, Vitest et TypeScript tout en ajoutant un script Node compatible `tsconfig` pour les chemins. Les tests d'export sont convertis en Vitest.

## Fichiers ajoutés/modifiés/supprimés
- vite.config.ts
- vitest.config.ts
- package.json
- package-lock.json
- tsconfig.json
- tsconfig.node.json
- test/exportHelpers.test.ts
- test/alias-node.ts
- docs/STATUS.md
- docs/reports/PR-016_report.md
- docs/reports/PR-016_report.json

## Scripts/commandes exécutables pour tester
```bash
npm run build
npm test
npm run node:paths test/alias-node.ts
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Le build Tauri échoue faute du crate `tauri-plugin-path`.

## Impact utilisateur
- Résolution uniforme de l'alias `@` pour le développement, les tests et les scripts Node.

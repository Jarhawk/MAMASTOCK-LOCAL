# PR-017 Report

## Résumé
Remplace les imports `@tauri-apps/plugin-path` par `@tauri-apps/api/path`, supprime le crate `tauri-plugin-path` et autorise cet API dans le script de vérification des imports.

## Fichiers ajoutés/modifiés/supprimés
- docs/STATUS.md
- package-lock.json
- package.json
- scripts/check-tauri-imports.js
- src-tauri/Cargo.lock
- src-tauri/Cargo.toml
- src-tauri/src/main.rs
- src/lib/db.ts
- src/lib/export/exportHelpers.js
- src/lib/lock.ts
- vite.config.ts
- vitest.config.ts
- docs/reports/PR-017_report.md
- docs/reports/PR-017_report.json

## Scripts/commandes exécutables pour tester
```bash
npm ci
npm run build
npm run check:tauri
npx tauri build
```

## Résultats de tests
*(voir rapport JSON)*

## Points encore ouverts
- Build Tauri échoue faute des bibliothèques système `glib-2.0`/`gio-2.0`.

## Impact utilisateur
- Utilisation de l'API de chemin officielle Tauri v2 et script d'import mis à jour.

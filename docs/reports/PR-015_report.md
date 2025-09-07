# PR-015 Report

## Résumé
Alignement des plugins Tauri v2 (path/fs/dialog/process) côté JS et Rust avec suppression du stub local `plugin-path` et mise à jour des dépendances.

## Fichiers ajoutés/modifiés/supprimés
- package.json
- package-lock.json
- vite.config.ts
- src-tauri/Cargo.toml
- src-tauri/Cargo.lock
- src-tauri/src/main.rs
- docs/STATUS.md
- docs/reports/PR-015_report.md
- docs/reports/PR-015_report.json
- plugins/plugin-path/* (supprimés)

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
- `npx tauri build` échoue faute de bibliothèque système `glib-2.0`.

## Impact utilisateur
- Utilisation des plugins Tauri v2 officiels (fs, dialog, process, path via alias).
- Suppression des stubs locaux et contrôle automatique des imports.

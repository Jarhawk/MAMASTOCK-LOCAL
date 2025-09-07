# PR-039-WIN Report

## Résumé
Ajoute un raccourci F12 et un menu "Aide > Ouvrir DevTools" pour ouvrir les DevTools sans conflit AMD.

## Fichiers ajoutés/modifiés/supprimés
- src/main.jsx
- src-tauri/src/main.rs
- docs/reports/PR-039-WIN_report.md
- docs/reports/PR-039-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm run build
npx tauri build
./src-tauri/target/release/mamastock
```

## Résultats de tests
*(voir rapport JSON)*

DevTools : F12 ou menu **Aide > Ouvrir DevTools**.

## Points encore ouverts
- Aucun.

## Impact utilisateur
- DevTools accessibles via F12 ou le menu "Aide".

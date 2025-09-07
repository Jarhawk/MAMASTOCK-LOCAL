# PR-034-WIN Report

## Résumé
Active temporairement les DevTools et journalise les erreurs globales pour faciliter le debug des écrans bleus.

## Fichiers ajoutés/modifiés/supprimés
- src-tauri/tauri.conf.json
- src/main.jsx
- docs/reports/PR-034-WIN_report.md
- docs/reports/PR-034-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
npm run build
npx tauri build
./src-tauri/target/release/mamastock
```

## Résultats de tests
*(voir rapport JSON)*

DevTools : `Ctrl+Shift+I` → onglet **Console**.

## Points encore ouverts
- Retirer ce mode de debug une fois l'enquête terminée.

## Impact utilisateur
- Permet d'inspecter les erreurs JavaScript derrière l'écran bleu via les DevTools.

# PR-030-WIN Report

## Résumé
Finalisation de la release Windows 1.0.0 : notes de version, rappel QA et script de vérification post-installation.

## Fichiers ajoutés/modifiés/supprimés
- CHANGELOG.md
- README.md
- docs/QA.md
- docs/STATUS.md
- scripts/postinstall-check.ps1
- docs/reports/PR-030-WIN_report.md
- docs/reports/PR-030-WIN_report.json

## Scripts/commandes exécutables pour tester
```bash
git tag v1.0.0-rc
npm ci
npm run build
npx tauri build
pwsh scripts/postinstall-check.ps1
```

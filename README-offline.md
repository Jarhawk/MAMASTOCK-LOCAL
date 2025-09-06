# MamaStock Offline

Cette variante embarque une base SQLite locale et Tauri pour fonctionner hors ligne.

## Choisir le dossier des données
- Lancez l'application puis ouvrez la page **Paramètres**.
- Sélectionnez le dossier qui contiendra `mamastock.db` et les fichiers de verrou (`db.lock.json`, `shutdown.request.json`).
- Le chemin est enregistré dans `%APPDATA%\MamaStock\config.json`.

## Règle "un seul poste à la fois"
Un fichier `db.lock.json` protège l'accès à la base. Un poste doit être fermé (menu quitter) avant d'ouvrir l'application sur un autre poste. Un `shutdown.request.json` peut être créé pour demander la libération du verrou.

## Synchronisation
Pour partager les données entre postes, utilisez un outil de synchronisation comme **Syncthing** sur le dossier de données.

## Build

```bash
npm ci
npx tauri dev
npx tauri build
```

Pour publier un installateur via CI :

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

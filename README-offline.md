# MamaStock Offline

**Système supporté : Windows 11 (x64) uniquement**

Cette variante, basée sur **Tauri v2**, embarque une base SQLite locale pour fonctionner hors ligne.

## Installation
- Télécharger l'installateur **MSI** produit par la CI.
- L'exécuter : le bootstrapper WebView2 gère automatiquement l'installation du moteur.

## Choisir le dossier des données
- Lancez l'application puis ouvrez la page **Paramètres**.
- Sélectionnez le dossier qui contiendra `mamastock.db` et les fichiers de verrou (`db.lock.json`, `shutdown.request.json`).
- Ce chemin est enregistré dans `%APPDATA%\\MamaStock\\config.json`. Sauvegardez ce dossier si vous changez de poste.
- À défaut de configuration, le dossier `%USERPROFILE%\\MamaStock\\data` est utilisé.

## Règle "un seul poste à la fois"
Un fichier `db.lock.json` protège l'accès à la base. Fermez l'application (menu **Quitter**) sur un poste avant de l'ouvrir ailleurs.
`shutdown.request.json` peut être créé pour demander la libération du verrou à distance.

## Synchronisation
Pour partager les données, synchronisez le dossier choisi avec un outil comme **Syncthing**.
Assurez‑vous qu'un seul poste utilise la base à la fois.

## Backup et restauration
- Depuis la page **Outils système**, cliquez sur **Sauvegarder** pour créer une copie horodatée de `mamastock.db` dans `Documents/MamaStock/Backups`.
- Le bouton **Restaurer** permet de choisir un fichier `.db`, de remplacer la base courante puis de redémarrer automatiquement l'application.
- **Maintenance** exécute `wal_checkpoint(TRUNCATE)` puis `VACUUM` pour compacter la base.
- `npm run backup` reste disponible en ligne de commande.

## Maintenance
- Vérifiez régulièrement que la synchronisation (Syncthing) est à jour.
- Nettoyez les exports périmés dans `Documents/MamaStock/Exports`.
- Conservez une sauvegarde avant toute mise à jour de l'application.

## Diagnostiquer un écran bleu
- Appuyez sur **F12** ou utilisez le menu/debug pour ouvrir les DevTools.
- Les erreurs sont aussi enregistrées dans `%APPDATA%\\com.mamastock.local\\logs\\renderer.log`.
- Ce fichier peut être ouvert via le bouton « Voir le fichier de logs » du ruban debug.

## Exports locaux
- Par défaut, les fichiers d'export (CSV, Excel, PDF) sont enregistrés dans `Documents/MamaStock/Exports`.
- Ce dossier peut être modifié depuis la page **Paramètres** en renseignant le « Dossier des exports ».
- Des boutons d'export sont disponibles sur les listes Produits, Fournisseurs et Factures.

## Scripts base de données
- `npm run db:apply` applique les migrations SQLite.
- `npm run db:smoke` vérifie les triggers et la valeur du stock.

## Icônes
Les icônes binaires (`.ico`/`.png`) ne sont pas versionnées. Elles sont générées depuis `assets/logo.svg` lors du build :

- localement via `npm run tauri:build` ;
- dans la CI via l'étape **Generate icons**.

Le paquet MSI est disponible dans `src-tauri/target/release/bundle/msi/*.msi`.

## Build local
Exécuter dans **PowerShell** :

```powershell
./build.ps1
```

Ce script installe Node.js LTS, Rustup, les Build Tools C++ de Visual Studio et le WiX Toolset via `winget`, puis lance `npm ci`, `npm run build` et `npx tauri build` (qui génère `src-tauri/icons` si nécessaire).

## Release
- Créez et poussez un tag `v1.0.0` (exemple).
- Récupérez l’installateur MSI généré par la CI dans l’onglet **Actions** ou la page **Releases** de GitHub.


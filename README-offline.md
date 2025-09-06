# MamaStock Offline

Cette variante embarque une base SQLite locale et Tauri pour fonctionner hors ligne.

## Choisir le dossier des données
- Lancez l'application puis ouvrez la page **Paramètres**.
- Sélectionnez le dossier qui contiendra `mamastock.db` et les fichiers de verrou (`db.lock.json`, `shutdown.request.json`).
- Ce chemin est enregistré dans `%APPDATA%\\MamaStock\\config.json`. Sauvegardez ce dossier si vous changez de poste.

## Règle "un seul poste à la fois"
Un fichier `db.lock.json` protège l'accès à la base. Fermez l'application (menu **Quitter**) sur un poste avant de l'ouvrir ailleurs.  
`shutdown.request.json` peut être créé pour demander la libération du verrou à distance.

## Synchronisation
Pour partager les données, synchronisez le dossier choisi avec un outil comme **Syncthing**.  
Assurez‑vous qu'un seul poste utilise la base à la fois.

## Backup et restauration
- `npm run backup` crée une copie horodatée de `mamastock.db` dans le répertoire courant.
- Pour restaurer, remplacez simplement le fichier `mamastock.db` par la sauvegarde souhaitée.

## Maintenance
- Vérifiez régulièrement que la synchronisation (Syncthing) est à jour.
- Nettoyez les exports périmés dans `Documents/MamaStock/Exports`.
- Conservez une sauvegarde avant toute mise à jour de l'application.

## Exports locaux
- Par défaut, les fichiers d'export (CSV, Excel, PDF) sont enregistrés dans `Documents/MamaStock/Exports`.
- Ce dossier peut être modifié depuis la page **Paramètres** en renseignant le « Dossier des exports ».
- Des boutons d'export sont disponibles sur les listes Produits, Fournisseurs et Factures.

## Build
- `npm ci`
- `npx tauri dev` pour le mode développement.
- `npx tauri build` pour produire l'exécutable et l'installateur MSI.
- Créez un tag `v*` et poussez-le pour déclencher la build CI Windows.

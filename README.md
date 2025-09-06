# MamaStock Offline

Cette variante, basée sur **Tauri v2**, embarque une base SQLite locale pour fonctionner hors ligne.

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

## Exports locaux
- Par défaut, les fichiers d'export (CSV, Excel, PDF) sont enregistrés dans `Documents/MamaStock/Exports`.
- Ce dossier peut être modifié depuis la page **Paramètres** en renseignant le « Dossier des exports ».
- Des boutons d'export sont disponibles sur les listes Produits, Fournisseurs et Factures.

## Scripts base de données
- `npm run db:apply` applique les migrations SQLite.
- `npm run db:smoke` vérifie les triggers et la valeur du stock.

## Build
- `npm ci`
- `npx tauri dev` pour le mode développement.
- `npx tauri build` pour produire l'exécutable et l'installateur MSI.
- Créez et poussez un tag `v1.0.0` (exemple) pour générer l'installeur Windows via la CI.

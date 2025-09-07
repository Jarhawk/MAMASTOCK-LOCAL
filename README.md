# MamaStock Offline

**Système supporté : Windows 11 (x64) uniquement**

**Exécuter build et dev dans PowerShell Windows (Administrateur), pas WSL/Git Bash.**

Cette variante, basée sur **Tauri v2**, embarque une base SQLite locale pour fonctionner hors ligne.

## Installation
- Prérequis : Windows 11 x64. Si WebView2 est absent, le bootstrapper l'installera.
- Télécharger l'installateur **MSI** produit par la CI.
- L'exécuter.

## Vérification post-installation
Après l'installation, le script suivant vérifie la présence de la configuration et de la base de données :

```powershell
pwsh scripts/postinstall-check.ps1
```

Par défaut, les chemins `%USERPROFILE%\\MamaStock\\data` (données) et `%APPDATA%\\MamaStock` (configuration) sont utilisés. Pour tester un autre dossier de données :

```powershell
pwsh scripts/postinstall-check.ps1 -DataDir "D:\MamaStock\data"
```

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
- Ce dossier peut être modifié depuis la page **Paramètres** en renseignant le « Dossier des exports ».
- Des boutons d'export sont disponibles sur les listes Produits, Fournisseurs et Factures.

## Scripts base de données
- `npm run db:apply` applique les migrations SQLite.
- `npm run db:smoke` vérifie les triggers et la valeur du stock.

## Build local
Exécuter `build.ps1` en **PowerShell Administrateur** (jamais depuis Git Bash ou WSL) :

```powershell
./build.ps1
```

S'assurer que **VS Build Tools (C++ x64)** et le **Windows 11 SDK** sont installés et activés ; `where lib.exe` doit répondre avant `npx tauri build`.

Ce script installe Node.js LTS, Rustup, le toolchain `stable-x86_64-pc-windows-msvc`, les Build Tools C++ de Visual Studio, le Windows 11 SDK et le WiX Toolset via `winget`, puis lance `npm ci`, `npm run icon:gen`, `npm run build` et `npx tauri build`.

## QA final
Avant de publier, vérifier ce parcours :

1. Se connecter avec l’administrateur créé via `npm run seed:admin`.
2. Créer un fournisseur puis un produit.
3. Émettre une facture (quantité 10, prix 2.5) et contrôler un PMP de 2.5 avec un stock de 10.
4. Exporter les données, sauvegarder la base, la restaurer et vérifier le redémarrage.
5. Démarrer une seconde instance : la première se ferme automatiquement.

## Publier une release Windows
```powershell
git tag v1.0.0
git push origin v1.0.0
```
L’installateur MSI apparaît automatiquement dans la page **Releases** de GitHub.


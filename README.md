# MamaStock Offline

**Système supporté : Windows 11 (x64) uniquement**

**Exécuter build et dev dans PowerShell Windows (Administrateur), pas WSL/Git Bash.**

Cette variante, basée sur **Tauri v2**, embarque une base SQLite locale pour fonctionner hors ligne.

## Installation
- Prérequis : Windows 11 x64. Si WebView2 est absent, le bootstrapper l'installera.
- Télécharger l'installateur **MSI** produit par la CI.
- L'exécuter.

## Vérification post-installation
Après l'installation, le script suivant vérifie Node, npm, Rust (MSVC), WebView2 et la présence/lecture de la configuration et de la base de données :

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

## Icônes
Les icônes binaires (`.ico`/`.png`) ne sont pas versionnées. Elles sont générées à partir de `assets/logo.svg` lors du build :

- en local avec `npm run tauri:build` ;
- en CI via l'étape **Generate icons**.
 
## Build Windows

```powershell
npm ci
npm run build:win
```

Le MSI est généré dans `src-tauri/target/release/bundle/msi/`.

## Build local
Exécuter `build.ps1` en **PowerShell Administrateur** (jamais depuis Git Bash ou WSL) :

```powershell
./build.ps1
```

S'assurer que **VS Build Tools (C++ x64)** et le **Windows 11 SDK** sont installés et activés ; `where lib.exe` doit répondre avant `npx tauri build`.

Ce script installe Node.js LTS, Rustup, le toolchain `stable-x86_64-pc-windows-msvc`, les Build Tools C++ de Visual Studio, le Windows 11 SDK et le WiX Toolset via `winget`, puis lance `npm ci`, `npm run build` et `npx tauri build` (qui génère `src-tauri/icons` si nécessaire).

## Mode DEV (fallback droits)

En développement local, la base SQLite peut être vierge et aucun compte n'est encore provisionné. Pour que l'interface reste navigable et que la sidebar s'affiche quoi qu'il arrive, créez un fichier `.env.development.local` (non versionné) contenant :

```
VITE_DATA_SOURCE=sqlite
VITE_ALLOW_ALL_ROUTES=1
```

`VITE_ALLOW_ALL_ROUTES=1` neutralise temporairement les gardes d'accès lorsque `import.meta.env.DEV` vaut `true`. Passez la variable à `0` (ou supprimez-la) pour retrouver le comportement RBAC réel. `VITE_DATA_SOURCE=sqlite` rappelle que le frontend doit utiliser la base locale embarquée.

Ensuite :

1. lancez `npm run dev` ;
2. dans une deuxième console, exécutez `npx tauri dev` pour ouvrir la fenêtre native.

En mode DEV, un badge **DEV** s'affiche dans la sidebar et toutes les routes deviennent accessibles. Si la fenêtre Tauri n'est pas ouverte, la couche SQLite retourne simplement des tableaux vides sans lever d'erreur (un message d'information est émis en console). Dès que l'application tourne hors DEV (build ou variables absentes), les restrictions classiques se réappliquent automatiquement.

## Parcours test

1. `npm run seed:admin` (admin@mamastock.local / Admin123!)
2. `npm run db:apply` puis `npm run db:smoke`
3. Lancer Vite + Tauri, se connecter
4. Créer fournisseur + produit
5. Créer facture (qty=10, prix=2.5) → vérifier pmp=2.5, stock=10
6. Export CSV/XLSX, backup + restore DB, relancer app

## Publier une release Windows
```powershell
git tag v1.0.0
git push origin v1.0.0
```
L’installateur MSI apparaît automatiquement dans la page **Releases** de GitHub.


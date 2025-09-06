# Base de données locale

Ce dossier contient les scripts SQL nécessaires pour initialiser la base de données SQLite utilisée par MamaStock en mode hors-ligne.

## Fichiers
- `001_schema.sql` : création du schéma et des triggers.
- `002_seed.sql` : insertion d'un compte administrateur de base.

## Application des migrations
Pour créer ou mettre à jour la base de données locale :

```bash
npm run db:apply
```

Par défaut la base `mamastock.db` est créée dans le répertoire courant. Ce comportement peut être modifié en passant un chemin au script :

```bash
node scripts/sqlite-apply.js /chemin/vers/mamastock.db
```

Le fichier `meta` garantit l'idempotence en stockant la version du schéma.

## Tests rapides
Un test rapide des triggers peut être exécuté avec :

```bash
npm run db:smoke
```

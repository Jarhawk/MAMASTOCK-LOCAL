# Base de données locale

Ce dossier contient les scripts SQL nécessaires pour initialiser la base de données SQLite utilisée par MamaStock en mode hors-ligne.

## Fichiers
- `001_schema.sql` : création du schéma et des triggers.
- `002_seed.sql` : insertion d'un compte administrateur de base.
- `003_pmp_valeur_stock.sql` : ajoute la colonne `valeur_stock` et recrée les triggers pour stock, valeur du stock et PMP.

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

Les fichiers de migration sont également copiés dans `public/migrations` pour être accessibles côté client.

## Tests rapides
Un test rapide des triggers peut être exécuté avec :

```bash
npm run db:smoke
```
